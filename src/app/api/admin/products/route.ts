import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';



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
