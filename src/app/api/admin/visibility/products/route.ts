import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Hide a product for a specific dealer
export async function POST(req: Request) {
  try {
    const { dealer_id, product_id } = await req.json();

    if (!dealer_id || !product_id) {
      return NextResponse.json({ error: 'Dealer ID and product ID are required.' }, { status: 400 });
    }

    // Check if dealer and product exist and are active
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

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .is('is_active', true)
      .is('deleted_at', null)
      .single();

    if (productError && productError.code !== 'PGRST116') {
      console.error('Error checking product existence:', productError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    if (!product) {
      return NextResponse.json({ error: 'Product not found or inactive.' }, { status: 400 });
    }

    const { data: hiddenProduct, error } = await supabase
      .from('dealer_hidden_products')
      .upsert({ dealer_id, product_id }, { onConflict: 'dealer_id,product_id' })
      .select()
      .single();

    if (error) {
      console.error('Error hiding product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, hiddenProduct }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error hiding product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Unhide a product for a specific dealer (DELETE method)
export async function DELETE(req: Request) {
  try {
    const { dealer_id, product_id } = await req.json();

    if (!dealer_id || !product_id) {
      return NextResponse.json({ error: 'Dealer ID and product ID are required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('dealer_hidden_products')
      .delete()
      .eq('dealer_id', dealer_id)
      .eq('product_id', product_id);

    if (error) {
      console.error('Error unhiding product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product unhidden for dealer.' });
  } catch (err) {
    console.error('Unexpected error unhiding product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


