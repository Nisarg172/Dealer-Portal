import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';


// GET /api/admin/products/[id] - Fetch details for a single product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {


  const productId = params.id;

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        base_price,
        description,
        is_active,
        categories ( id, name )
        `
      )
      .eq('id', productId)
      .is('deleted_at', null) // Only active (not soft-deleted) products
      .single();

    if (error || !product) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found or database error.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error('Unexpected error fetching product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] - Update details for a single product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
 

  const productId = params.id;
  const { name, category_id, base_price, description, status } = await req.json();

  if (!name || !category_id || !base_price || !description || !status) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        name,
        category_id,
        base_price,
        description,
        is_active: status === 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select(
        `
        id,
        name,
        base_price,
        is_active,
        categories ( id, name )
        `
      )
      .single();

    if (error || !updatedProduct) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error updating product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Soft delete a product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {


  const productId = params.id;

  try {
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) {
      console.error('Error soft-deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product soft-deleted successfully!' });
  } catch (err) {
    console.error('Unexpected error soft-deleting product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
