import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Context {
  params: { id: string };
}

// Get all hidden categories and products for a specific dealer
export async function GET(req: Request, context: Context) {
  try {
    const { id: dealerId } = context.params;

    // Fetch hidden categories for the dealer
    const { data: hiddenCategories, error: hiddenCategoriesError } = await supabase
      .from('dealer_hidden_categories')
      .select(
        `
        id,
        categories ( id, name )
      `
      )
      .eq('dealer_id', dealerId);

    if (hiddenCategoriesError) {
      console.error('Error fetching hidden categories:', hiddenCategoriesError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Fetch hidden products for the dealer
    const { data: hiddenProducts, error: hiddenProductsError } = await supabase
      .from('dealer_hidden_products')
      .select(
        `
        id,
        products ( id, name, categories ( name ) )
      `
      )
      .eq('dealer_id', dealerId);

    if (hiddenProductsError) {
      console.error('Error fetching hidden products:', hiddenProductsError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ hiddenCategories, hiddenProducts });
  } catch (err) {
    console.error('Unexpected error fetching dealer visibility:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


