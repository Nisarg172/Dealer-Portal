import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';




// GET /api/admin/orders - Fetch all orders
export async function GET(req: NextRequest) {
  try {

    /* ----------------------------
       Read query params
    ----------------------------- */
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') ?? '';
    const sortBy = searchParams.get('sortBy') ?? 'created_at';
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);

    const filterKey = searchParams.get('filter[key]');
    const filterValue = searchParams.get('filter[value]');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    /* ----------------------------
       Base query
    ----------------------------- */
    let query = supabase
      .from('orders')
      .select(
        `
        id,
        total_amount,
        order_status,
        created_at,
        dealers (
          name,
          company_name,
          users ( email, phone )
        )
        `,
        { count: 'exact' }
      );

    /* ----------------------------
       Search (Dealer name)
    ----------------------------- */
    if (search) {
      query = query.or(`dealers.name.ilike.%${search}%`);
    }

    /* ----------------------------
       Filtering
    ----------------------------- */
    if (filterKey && filterValue) {
      query = query.eq(filterKey, filterValue);
    }

    /* ----------------------------
       Sorting
    ----------------------------- */
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    /* ----------------------------
       Pagination
    ----------------------------- */
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    /* ----------------------------
       Format response
    ----------------------------- */
    const formattedOrders = data.map(order => ({
      id: order.id,
      total_amount: order.total_amount,
      order_status: order.order_status,
      created_at: order.created_at,
      dealer_name: order.dealers?.name ?? '—',
      dealer_company: order.dealers?.company_name ?? '—',
      dealer_email: order.dealers?.users?.email ?? '—',
      dealer_phone: order.dealers?.users?.phone ?? null,
    }));

    return NextResponse.json({
      data: formattedOrders,
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

