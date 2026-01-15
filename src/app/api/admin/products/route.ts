import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';




// GET /api/admin/products - Fetch all products
export async function GET(req: NextRequest) {
  try {
    /* ----------------------------
       Read query params
    ----------------------------- */
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') ?? '';
    const sortBy = searchParams.get('sortBy') ?? 'name';
    const sortOrder = (searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc';
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);
    const filterKey:string|null = searchParams.get('filter[key]')??null ;
    const filterValue:string|null = searchParams.get('filter[value]')??null ;

    console.log('Filter Param:', { key: filterKey, value: filterValue });

    const from = (page - 1) * limit;
    const to = from + limit - 1;


    /* ----------------------------
       Base query
    ----------------------------- */
    let query = supabase
      .from('products')
      .select(
        `
        id,
        name,
        base_price,
        is_active,
        categories!inner( id, name )
        `,
        { count: 'exact' }
      )
      .is('deleted_at', null);

    /* ----------------------------
       Search (name + category)
    ----------------------------- */
    if (search) {
      query = query.or(
        `name.ilike.%${search}%`
      );
    }

    /* ----------------------------
       Sorting
    ----------------------------- */
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

     /* ----------------------------
       filtering
    ----------------------------- */
    if (filterKey && filterValue) {
      query = query.eq(filterKey, filterValue);
    }

    /* ----------------------------
       Pagination
    ----------------------------- */
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /* ----------------------------
       Response for DataTable
    ----------------------------- */
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
    console.error('Unexpected error fetching products:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// POST /api/admin/products - Create a new product
export async function POST(req: NextRequest) {

  try {
    /* ---------------- Parse FormData ---------------- */
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
    const base_price = Number(formData.get('base_price'));
    const description = formData.get('description') as string;
    const status = formData.get('status') as string;

    const datasheet_url = formData.get('datasheet_url') as string | null;
    const product_url = formData.get('product_url') as string | null;

    const imageFile = formData.get('product_image') as File | null;

    if (!name || !category_id || !base_price || !description || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* ---------------- Upload Image ---------------- */
    let imageUrls: string[] = [];

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `products/${randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        return NextResponse.json(
          { error: 'Image upload failed' },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      imageUrls.push(publicUrlData.publicUrl);
    }

    /* ---------------- Insert Product ---------------- */
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        name,
        category_id,
        base_price,
        description,
        image_urls: imageUrls,
        datasheet_url,
        product_url,
        is_active: status === 'active',
      })
      .select(
        `
        id,
        name,
        base_price,
        is_active,
        image_urls,
        datasheet_url,
        product_url,
        categories ( id, name )
        `
      )
      .single();

    if (error) {
      console.error('DB Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (err) {
    console.error('Unexpected Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
