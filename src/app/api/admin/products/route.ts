import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';



// GET /api/admin/products - Fetch all products
export async function GET(req: NextRequest) {



  try {
    const { data: products, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        base_price,
        is_active,
        categories ( id, name )
        `
      )
      .is('deleted_at', null) // Only active (not soft-deleted) products
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/products - Create a new product
export async function POST(req: NextRequest) {


  const { name, category_id, base_price, description, status } = await req.json();

  if (!name || !category_id || !base_price || !description || !status) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({ name, category_id, base_price, description, is_active: status === 'active' })
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

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating product:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
