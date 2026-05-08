import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';

// GET /api/admin/categories - Fetch all categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'main_category';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? false : true;
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const sortableColumns = new Set(['name', 'main_category', 'created_at', 'updated_at']);
    const sortColumn = sortableColumns.has(sortBy) ? sortBy : 'main_category';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('categories')
      .select('id, name, image_url, main_category', { count: 'exact' })
      .is('deleted_at', null)
      .order(sortColumn, { ascending: sortOrder })
      .order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,main_category.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalizedData =
      data?.map((category) => ({
        ...category,
        main_category: category.main_category || category.name,
      })) || [];

    return NextResponse.json({
      data: normalizedData,
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
    let subCategoryName = '';
    let mainCategory = '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      subCategoryName = (
        (formData.get('sub_category') as string) ||
        (formData.get('name') as string) ||
        ''
      ).trim();
      mainCategory = ((formData.get('main_category') as string) || '').trim();
      imageFile = formData.get('category_image') as File | null;
    } else {
      const body = await req.json();
      subCategoryName = (body?.sub_category || body?.name || '').trim();
      mainCategory = (body?.main_category || '').trim();
    }

    if (!subCategoryName) {
      return NextResponse.json({ error: 'Sub category name is required.' }, { status: 400 });
    }
    const normalizedMainCategory = mainCategory || subCategoryName;

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
      .insert({ name: subCategoryName, main_category: normalizedMainCategory, image_url })
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
