import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Assign or update a category-wise discount for a dealer
export async function POST(req: Request) {
  try {
    const { dealer_id, category_id, discount_percentage } = await req.json();

    if (!dealer_id || !category_id || discount_percentage === undefined) {
      return NextResponse.json({ error: 'Dealer ID, category ID, and discount percentage are required.' }, { status: 400 });
    }

    if (discount_percentage < 0 || discount_percentage > 100) {
      return NextResponse.json({ error: 'Discount percentage must be between 0 and 100.' }, { status: 400 });
    }

    // Check if dealer and category exist and are active
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('id', dealer_id)
      .is('deleted_at', null)
      .single();

    if (dealerError && dealerError.code !== 'PGRST116') {
      console.error('Error checking dealer existence:', dealerError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found or inactive.' }, { status: 400 });
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .is('is_active', true)
      .is('deleted_at', null)
      .single();

    if (categoryError && categoryError.code !== 'PGRST116') {
      console.error('Error checking category existence:', categoryError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category not found or inactive.' }, { status: 400 });
    }

    // Insert or update the discount
    const { data: newDiscount, error } = await supabase
      .from('dealer_category_discounts')
      .upsert({ dealer_id, category_id, discount_percentage }, { onConflict: 'dealer_id,category_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting discount:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, discount: newDiscount }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error assigning discount:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Get all dealer-category discounts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealer_id');
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('dealer_category_discounts')
      .select(
        `
        id,
        discount_percentage,
        dealers ( id, name, company_name ),
        categories ( id, name )
      `
      );

    if (dealerId) {
      query = query.eq('dealer_id', dealerId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: discounts, error } = await query;

    if (error) {
      console.error('Error fetching discounts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ discounts });
  } catch (err) {
    console.error('Unexpected error fetching discounts:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



