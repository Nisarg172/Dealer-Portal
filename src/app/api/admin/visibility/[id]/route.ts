import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Fetch existing category and product visibility settings for a specific dealer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealerId = params.id;

  try {
    // Fetch hidden categories for this dealer
    const { data: hiddenCategories, error: hiddenCategoriesError } = await supabase
      .from('dealer_hidden_categories')
      .select('category_id')
      .eq('dealer_id', dealerId);

    if (hiddenCategoriesError) {
      console.error('Error fetching hidden categories:', hiddenCategoriesError);
      return NextResponse.json({ error: hiddenCategoriesError.message }, { status: 500 });
    }

    // Fetch hidden products for this dealer
    const { data: hiddenProducts, error: hiddenProductsError } = await supabase
      .from('dealer_hidden_products')
      .select('product_id')
      .eq('dealer_id', dealerId);

    if (hiddenProductsError) {
      console.error('Error fetching hidden products:', hiddenProductsError);
      return NextResponse.json({ error: hiddenProductsError.message }, { status: 500 });
    }

    const settings = {
      hidden_categories: hiddenCategories?.map(item => item.category_id) || [],
      hidden_products: hiddenProducts?.map(item => item.product_id) || [],
    };

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Unexpected error fetching dealer visibility settings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update category and product visibility settings for a specific dealer
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dealerId = params.id;
  const { hidden_categories, hidden_products } = await req.json();

  try {
    // 1. Update hidden categories
    const { error: deleteCategoriesError } = await supabase
      .from('dealer_hidden_categories')
      .delete()
      .eq('dealer_id', dealerId);

    if (deleteCategoriesError) {
      console.error('Error deleting existing hidden categories:', deleteCategoriesError);
      return NextResponse.json({ error: deleteCategoriesError.message }, { status: 500 });
    }

    if (hidden_categories && hidden_categories.length > 0) {
      const categoriesToInsert = hidden_categories.map((categoryId: string) => ({ dealer_id: dealerId, category_id: categoryId }));
      const { error: insertCategoriesError } = await supabase
        .from('dealer_hidden_categories')
        .insert(categoriesToInsert);

      if (insertCategoriesError) {
        console.error('Error inserting new hidden categories:', insertCategoriesError);
        return NextResponse.json({ error: insertCategoriesError.message }, { status: 500 });
      }
    }

    // 2. Update hidden products
    const { error: deleteProductsError } = await supabase
      .from('dealer_hidden_products')
      .delete()
      .eq('dealer_id', dealerId);

    if (deleteProductsError) {
      console.error('Error deleting existing hidden products:', deleteProductsError);
      return NextResponse.json({ error: deleteProductsError.message }, { status: 500 });
    }

    if (hidden_products && hidden_products.length > 0) {
      const productsToInsert = hidden_products.map((productId: string) => ({ dealer_id: dealerId, product_id: productId }));
      const { error: insertProductsError } = await supabase
        .from('dealer_hidden_products')
        .insert(productsToInsert);

      if (insertProductsError) {
        console.error('Error inserting new hidden products:', insertProductsError);
        return NextResponse.json({ error: insertProductsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Visibility settings updated successfully!' });
  } catch (err) {
    console.error('Unexpected error updating dealer visibility settings:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

