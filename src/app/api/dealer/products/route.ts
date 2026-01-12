import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { calculateDealerPrice } from '@/lib/priceCalculator';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

async function getDealerIdFromAuth() {
    const token = cookies().get('auth_token')?.value;
    if (!token || !JWT_SECRET) {
      return null;
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userId = payload.id as string;
  
      const { data: dealerData, error: dealerError } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();
  
      if (dealerError || !dealerData) {
        console.error('Error fetching dealer data in dealer products API:', dealerError);
        return null;
      }
      return dealerData.id; 
    } catch (error) {
      console.error('Error verifying token in dealer products API:', error);
      return null;
    }
}

// GET /api/dealer/products - Fetch all visible and discounted products for a dealer
export async function GET(req: NextRequest) {
  const dealerId = await getDealerIdFromAuth();
  if (!dealerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }


  try {
    // Fetch all active products and their categories
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        base_price,
        description,
        is_active,
        category: categories ( id, name )
        `
      )
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (productsError) {
      console.error('Error fetching products for dealer:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
    }

    // Fetch dealer-specific hidden categories and products
    const { data: hiddenCategories } = await supabase
      .from('dealer_hidden_categories')
      .select('category_id')
      .eq('dealer_id', dealerId);
    const hiddenCategoryIds = new Set(hiddenCategories?.map(c => c.category_id) || []);

    const { data: hiddenProducts } = await supabase
      .from('dealer_hidden_products')
      .select('product_id')
      .eq('dealer_id', dealerId);
    const hiddenProductIds = new Set(hiddenProducts?.map(p => p.product_id) || []);

    // Filter products based on visibility and calculate discounted prices
    const dealerProducts = await Promise.all(products.map(async (product) => {
      const categoryId = product.category?.id; // Adjust based on your category join structure

      // Apply visibility rules
      if (hiddenProductIds.has(product.id) || (categoryId && hiddenCategoryIds.has(categoryId))) {
        return null; // Product or its category is hidden
      }

      // Calculate discounted price
      const discountedPrice = await calculateDealerPrice({
        id: product.id,
        base_price: product.base_price,
        category_id: categoryId || '',
      }, { dealerId });

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        base_price: product.base_price,
        discounted_price: discountedPrice,
        category_name: product.category?.name,
        // Add image_url here if available from DB
      };
    }));

    const filteredDealerProducts = dealerProducts.filter(p => p !== null);

    return NextResponse.json({ products: filteredDealerProducts });
  } catch (err) {
    console.error('Unexpected error fetching dealer products:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
