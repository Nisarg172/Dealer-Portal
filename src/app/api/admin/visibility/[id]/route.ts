import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Fetch existing category and product visibility settings for a specific dealer
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const dealerId = params.id;

  const { data: hiddenCategories } = await supabase
    .from('dealer_hidden_categories')
    .select('categories ( id, name )')
    .eq('dealer_id', dealerId);

  const { data: hiddenProducts } = await supabase
    .from('dealer_hidden_products')
    .select('products ( id, name )')
    .eq('dealer_id', dealerId);

  return NextResponse.json({ hiddenCategories, hiddenProducts });
}


// Update category and product visibility settings for a specific dealer
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const dealerId = params.id;
  const body = await req.json();

  await supabase.from('dealer_hidden_categories').delete().eq('dealer_id', dealerId);
  await supabase.from('dealer_hidden_products').delete().eq('dealer_id', dealerId);

  if (body.hidden_categories?.length) {
    await supabase.from('dealer_hidden_categories').insert(
      body.hidden_categories.map((id: string) => ({
        dealer_id: dealerId,
        category_id: id,
      }))
    );
  }

  if (body.hidden_products?.length) {
    await supabase.from('dealer_hidden_products').insert(
      body.hidden_products.map((id: string) => ({
        dealer_id: dealerId,
        product_id: id,
      }))
    );
  }

  return NextResponse.json({ success: true });
}


