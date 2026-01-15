import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { calculateDealerPrice } from '@/lib/priceCalculator';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

async function getDealerIdFromAuth() {
    const token = cookies().get('auth_token')?.value;
    if (!token || !JWT_SECRET) {
      return null;
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      const userId = payload.id as string;
  
      const { data: dealerData, error: dealerError } = await supabase
        .from('dealers')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();
  
      if (dealerError || !dealerData) {
        console.error('Error fetching dealer data in dealer orders API:', dealerError);
        return null;
      }
      return dealerData.id; 
    } catch (error) {
      console.error('Error verifying token in dealer orders API:', error);
      return null;
    }
}

// POST /api/dealer/orders - Place a new order from cart
export async function POST(req: NextRequest) {
    const dealerId = await getDealerIdFromAuth();
    if (!dealerId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: cartItems, error: cartError } = await supabase
            .from('dealer_cart_items')
            .select(`
                product_id,
                quantity,
                products (
                    id,
                    name,
                    base_price,
                    is_active,
                    category_id: categories (id)
                )
            `)
            .eq('dealer_id', dealerId);

        if (cartError) {
            console.error(cartError);
            return NextResponse.json({ error: 'Failed to fetch cart items.' }, { status: 500 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
        }

        let subtotal = 0;
        const orderItemsToInsert: any[] = [];

        for (const item of cartItems) {
            const product = item.products;
            if (!product || !product.is_active) {
                return NextResponse.json(
                    { error: `Product '${product?.name}' is no longer available.` },
                    { status: 400 }
                );
            }

            const productId = product.id;
            const categoryId = product.category_id?.id;

            // Visibility check
            const { data: hiddenProduct } = await supabase
                .from('dealer_hidden_products')
                .select('product_id')
                .eq('dealer_id', dealerId)
                .eq('product_id', productId)
                .single();

            const { data: hiddenCategory } = await supabase
                .from('dealer_hidden_categories')
                .select('category_id')
                .eq('dealer_id', dealerId)
                .eq('category_id', categoryId)
                .single();

            if (hiddenProduct || hiddenCategory) {
                return NextResponse.json(
                    { error: `Product '${product.name}' is no longer visible.` },
                    { status: 403 }
                );
            }

            const discountedPrice = await calculateDealerPrice(
                {
                    id: productId,
                    base_price: product.base_price,
                    category_id: categoryId,
                },
                { dealerId }
            );

            subtotal += discountedPrice * item.quantity;

            orderItemsToInsert.push({
                product_id: productId,
                quantity: item.quantity,
                price_at_order: discountedPrice,
            });
        }

        if (orderItemsToInsert.length === 0) {
            return NextResponse.json(
                { error: 'No valid items to place order.' },
                { status: 400 }
            );
        }

        /* ---------------- GST CALCULATION ---------------- */
        const GST_PERCENT = 18;
        const gstAmount = +(subtotal * GST_PERCENT / 100).toFixed(2);
        const totalAmount = +(subtotal + gstAmount).toFixed(2);

        /* ---------------- CREATE ORDER ---------------- */
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                dealer_id: dealerId,
                subtotal,
                gst_amount: gstAmount,
                total_amount: totalAmount,
                order_status: 'pending',
            })
            .select('id')
            .single();

        if (orderError || !newOrder) {
            console.error(orderError);
            return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
        }

        /* ---------------- INSERT ORDER ITEMS ---------------- */
        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(
                orderItemsToInsert.map(item => ({
                    ...item,
                    order_id: newOrder.id,
                }))
            );

        if (orderItemsError) {
            console.error(orderItemsError);
            return NextResponse.json({ error: 'Failed to add order items.' }, { status: 500 });
        }

        /* ---------------- CLEAR CART ---------------- */
        await supabase
            .from('dealer_cart_items')
            .delete()
            .eq('dealer_id', dealerId);

        return NextResponse.json({
            success: true,
            message: 'Order placed successfully!',
            orderId: newOrder.id,
            subtotal,
            gstAmount,
            totalAmount,
        });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


// GET /api/dealer/orders - Fetch all orders for a dealer

export async function GET(req: NextRequest) {
  const dealerId = await getDealerIdFromAuth();
  if (!dealerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
        created_at
        `,
        { count: 'exact' }
      )
      .eq('dealer_id', dealerId);

    /* ----------------------------
       Search (Order ID)
    ----------------------------- */
    if (search) {
      query = query.ilike('id', `%${search}%`);
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

