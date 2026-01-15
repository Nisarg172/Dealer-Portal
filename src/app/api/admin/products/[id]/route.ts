import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';


// GET /api/admin/products/[id] - Fetch details for a single product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category_id,
        base_price,
        description,
        image_urls,
        datasheet_url,
        product_url,
        is_active,
        categories ( id, name )
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        ...product,
        status: product.is_active ? 'active' : 'inactive',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// PUT /api/admin/products/[id] - Update details for a single product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const formData = await req.formData();

  const name = formData.get('name') as string;
  const category_id = formData.get('category_id') as string;
  const base_price = Number(formData.get('base_price'));
  const description = formData.get('description') as string;
  const status = formData.get('status') as string;
  const datasheet_url = formData.get('datasheet_url') as string | null;
  const product_url = formData.get('product_url') as string | null;

  const images = formData.getAll('product_image') as File[];

  if (!name || !category_id || !base_price || !description || !status) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    /* -------- Fetch existing product -------- */
    const { data: existing } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', params.id)
      .single();

    let image_urls = existing?.image_urls || [];

    /* -------- Replace image if new provided -------- */
    if (images.length > 0 && images[0].size > 0) {
      // Delete old images
      for (const url of image_urls) {
        const path = url.split('/product-images/')[1];
        if (path) {
          await supabase.storage
            .from('product-images')
            .remove([path]);
        }
      }

      // Upload new image
      image_urls = [];
      for (const image of images) {
        const ext = image.name.split('.').pop();
        const fileName = `${randomUUID()}.${ext}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, image);

        if (error) throw error;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        image_urls.push(data.publicUrl);
      }
    }

    /* -------- Update product -------- */
    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        category_id,
        base_price,
        description,
        datasheet_url,
        product_url,
        image_urls,
        is_active: status === 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
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
