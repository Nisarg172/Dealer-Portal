import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Fetch existing category-wise discounts for a specific dealer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealerId = params.id;

  try {
    // Fetch existing discounts for this dealer
    const { data: discounts, error: discountsError } = await supabase
      .from('dealer_category_discounts')
      .select('category_id, discount_percentage')
      .eq('dealer_id', dealerId);

    if (discountsError) {
      console.error('Error fetching dealer discounts:', discountsError);
      return NextResponse.json({ error: discountsError.message }, { status: 500 });
    }

    return NextResponse.json({ discounts });
  } catch (err) {
    console.error('Unexpected error fetching dealer discounts:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update category-wise discounts for a specific dealer
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dealerId = params.id;
  const { discounts } = await req.json(); // Array of { category_id, discount_percentage }

  try {
    // Start a transaction (Supabase client doesn't directly support transactions in this way)
    // A common pattern is to delete all existing and then insert new ones.
    // Or perform upserts if your table supports it.

    // 1. Delete all existing discounts for this dealer
    const { error: deleteError } = await supabase
      .from('dealer_category_discounts')
      .delete()
      .eq('dealer_id', dealerId);

    if (deleteError) {
      console.error('Error deleting existing discounts:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Insert new discounts
    const discountsToInsert = discounts.map((discount: { category_id: string; discount_percentage: number }) => ({
      dealer_id: dealerId,
      category_id: discount.category_id,
      discount_percentage: discount.discount_percentage,
    }));

    const { error: insertError } = await supabase
      .from('dealer_category_discounts')
      .insert(discountsToInsert);

    if (insertError) {
      console.error('Error inserting new discounts:', insertError);
      // In a real scenario, you might want to try to re-insert the old ones if this fails
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Discounts updated successfully!' });
  } catch (err) {
    console.error('Unexpected error updating dealer discounts:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
