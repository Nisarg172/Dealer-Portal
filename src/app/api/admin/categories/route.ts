import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';

// GET /api/admin/categories - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? false : true;
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('categories')
      .select('id, name, image_url', { count: 'exact' })
      .is('deleted_at', null)
      .order(sortBy, { ascending: sortOrder });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(req: NextRequest) {
  const payload = await getAdminIdFromAuth();
  if (!payload || payload?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let name = '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = ((formData.get('name') as string) || '').trim();
      imageFile = formData.get('category_image') as File | null;
    } else {
      const body = await req.json();
      name = (body?.name || '').trim();
    }

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    let image_url: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `categories/${randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading category image:', uploadError);
        return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      image_url = publicUrlData.publicUrl;
    }

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ name, image_url })
      .select();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating category:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
