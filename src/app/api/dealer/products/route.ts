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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id');

  try {
    /* -------- Fetch products -------- */
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        base_price,
        description,
        image_urls,
        category: categories ( id, name )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    /* -------- Hidden logic -------- */
    const { data: hiddenCategories } = await supabase
      .from('dealer_hidden_categories')
      .select('category_id')
      .eq('dealer_id', dealerId);

    const { data: hiddenProducts } = await supabase
      .from('dealer_hidden_products')
      .select('product_id')
      .eq('dealer_id', dealerId);

    const hiddenCategoryIds = new Set(hiddenCategories?.map(c => c.category_id));
    const hiddenProductIds = new Set(hiddenProducts?.map(p => p.product_id));

    /* -------- Build dealer product list -------- */
    const result = await Promise.all(
      products.map(async (product) => {
        if (
          hiddenProductIds.has(product.id) ||
          hiddenCategoryIds.has(product.category?.id)
        ) {
          return null;
        }

        const discountedPrice = await calculateDealerPrice(
          {
            id: product.id,
            base_price: product.base_price,
            category_id: product.category?.id,
          },
          { dealerId }
        );

        return {
          id: product.id,
          name: product.name,
          base_price: product.base_price,
          discounted_price: discountedPrice,
          category_name: product.category?.name,
          image_url: product.image_urls?.[0] || null,
        };
      })
    );

    return NextResponse.json({
      products: result.filter(Boolean),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
