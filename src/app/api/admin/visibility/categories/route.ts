import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hide a category for a specific dealer
export async function POST(req: Request) {
  try {
    const { dealer_id, category_id } = await req.json();

    if (!dealer_id || !category_id) {
      return NextResponse.json({ error: 'Dealer ID and category ID are required.' }, { status: 400 });
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

    const { data: hiddenCategory, error } = await supabase
      .from('dealer_hidden_categories')
      .upsert({ dealer_id, category_id }, { onConflict: 'dealer_id,category_id' })
      .select()
      .single();

    if (error) {
      console.error('Error hiding category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, hiddenCategory }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error hiding category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Unhide a category for a specific dealer (DELETE method)
export async function DELETE(req: Request) {
  try {
    const { dealer_id, category_id } = await req.json();

    if (!dealer_id || !category_id) {
      return NextResponse.json({ error: 'Dealer ID and category ID are required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('dealer_hidden_categories')
      .delete()
      .eq('dealer_id', dealer_id)
      .eq('category_id', category_id);

    if (error) {
      console.error('Error unhiding category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category unhidden for dealer.' });
  } catch (err) {
    console.error('Unexpected error unhiding category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


