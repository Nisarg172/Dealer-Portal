import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { calculateDealerPrice } from '@/lib/priceCalculator'; // Assuming this utility exists
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to get dealer ID from JWT (middleware should have already ensured validity)
async function getDealerIdFromAuth() {
  const token = cookies().get('auth_token')?.value;
  if (!token || !JWT_SECRET) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const userId = payload.id as string;

    // In a real app, you'd verify this user is indeed a dealer and get their dealer_id
    // For this example, assuming user ID directly maps to dealer_id if they are a dealer
    return userId; 
  } catch (error) {
    console.error('Error verifying token in dealer product detail API:', error);
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const productId = params.id;

  try {
    const userId = await getDealerIdFromAuth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch dealer ID from user ID
    const { data: dealerData, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();
    if (dealerError || !dealerData) {
      console.error('Error fetching dealer data:', dealerError);
      return NextResponse.json({ error: 'Dealer not found or inactive.' }, { status: 403 });
    }

    // 1. Fetch product details and its category
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        base_price,
        is_active,
        category: categories ( id, name )
        `
      )
      .eq('id', productId)
      .single();

    if (productError || !productData) {
      console.error('Error fetching product:', productError);
      return NextResponse.json({ error: 'Product not found or database error' }, { status: 404 });
    }

    // Check if product is globally inactive
    if (productData.is_active === false) {
        return NextResponse.json({ error: 'Product is currently inactive.' }, { status: 404 });
    }

    const categoryId = productData.category?.id; 

    // 2. Check dealer-specific visibility
    // Check if product is hidden for this dealer
    const { data: hiddenProduct, error: hiddenProductError } = await supabase
      .from('dealer_hidden_products')
      .select('product_id')
      .eq('dealer_id', dealerData.id)
      .eq('product_id', productId)
      


    if (hiddenProductError && hiddenProductError.code !== 'PGRST116') {
      console.error('Error checking hidden product status:', hiddenProductError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (hiddenProduct && hiddenProduct.length > 0) {
      return NextResponse.json({ error: 'Product not visible to this dealer.' }, { status: 404 });
    }

    // Check if category is hidden for this dealer (if category exists)
    if (categoryId) {
        const { data: hiddenCategory, error: hiddenCategoryError } = await supabase
        .from('dealer_hidden_categories')
        .select('category_id')
        .eq('dealer_id', dealerData.id)
        .eq('category_id', categoryId)
        .single();

        if (hiddenCategoryError && hiddenCategoryError.code !== 'PGRST116') {
            console.error('Error checking hidden category status:', hiddenCategoryError);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
        if (hiddenCategory) {
            return NextResponse.json({ error: 'Product category not visible to this dealer.' }, { status: 404 });
          }
        }

    // 3. Apply dealer-specific discounts
    let discountedPrice = productData.base_price;
    let dealerCategoryDiscount = 0;

    // if (categoryId) {
    //   const { data: discountData, error: discountError } = await supabase
    //     .from('dealer_category_discounts')
    //     .select('discount_percentage')
    //     .eq('dealer_id', dealerId)
    //     .eq('category_id', categoryId)
    //     .single();

    //   if (discountError && discountError.code !== 'PGRST116') {
    //     console.error('Error fetching dealer category discount:', discountError);
    //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    //   }
    //   dealerCategoryDiscount = discountData?.discount_percentage || 0;
    // }
    
    // Assuming calculateDiscountedPrice utility handles applying the percentage
  
    discountedPrice = await calculateDealerPrice({ id: productData.id,
  base_price: productData.base_price,
  category_id: productData.category.id || ''}, {dealerId: dealerData.id});

  console.log("Final discounted price:", discountedPrice);
    return NextResponse.json({
      product: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        base_price: productData.base_price,
        discounted_price: discountedPrice,
        category_name: productData.category?.name,
        // Add image_url here if available from DB
      },
    });
  } catch (err) {
    console.error('Unexpected error in dealer product detail API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

