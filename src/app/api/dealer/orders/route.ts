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
        // Fetch current cart items for validation
        const { data: cartItems, error: cartError } = await supabase
            .from('dealer_cart_items')
            .select(
                `
                product_id,
                quantity,
                products ( id, name, base_price, is_active, category_id: categories (id) )
                `
            )
            .eq('dealer_id', dealerId);

        if (cartError) {
            console.error('Error fetching cart items for order placement:', cartError);
            return NextResponse.json({ error: 'Failed to fetch cart items.' }, { status: 500 });
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Your cart is empty. Cannot place an order.' }, { status: 400 });
        }

        let totalAmount = 0;
        const orderItemsToInsert: any[] = [];

        for (const item of cartItems) {
            const productId = item.products?.id;
            const productName = item.products?.name;
            const basePrice = item.products?.base_price;
            const isActive = item.products?.is_active;
            const categoryId = item.products?.category_id?.id;

            if (!productId || !productName || basePrice === undefined || isActive === undefined || !categoryId) {
                console.warn(`Missing product details for cart item ${item.product_id}, skipping.`);
                continue; // Skip invalid items
            }
            if (!isActive) {
                return NextResponse.json({ error: `Product '${productName}' is no longer active.` }, { status: 400 });
            }

            // Re-check visibility (in case it changed since added to cart)
            const { data: hiddenProduct } = await supabase.from('dealer_hidden_products').select('product_id').eq('dealer_id', dealerId).eq('product_id', productId).single();
            const { data: hiddenCategory } = await supabase.from('dealer_hidden_categories').select('category_id').eq('dealer_id', dealerId).eq('category_id', categoryId).single();

            if (hiddenProduct || hiddenCategory) {
                return NextResponse.json({ error: `Product '${productName}' is no longer visible to you.` }, { status: 403 });
            }

            const discountedPrice = await calculateDealerPrice({ id: productId, base_price: basePrice, category_id: categoryId }, { dealerId });

            orderItemsToInsert.push({
                product_id: productId,
                quantity: item.quantity,
                price_at_order: discountedPrice,
            });
            totalAmount += discountedPrice * item.quantity;
        }

        if (orderItemsToInsert.length === 0) {
            return NextResponse.json({ error: 'No valid items in cart to place an order.' }, { status: 400 });
        }

        // Create the order
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                dealer_id: dealerId,
                total_amount: totalAmount,
                order_status: 'pending', // Initial status
            })
            .select('id')
            .single();

        if (orderError || !newOrder) {
            console.error('Error creating order:', orderError);
            return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
        }

        // Insert order items
        const itemsWithOrderId = orderItemsToInsert.map(item => ({ ...item, order_id: newOrder.id }));
        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(itemsWithOrderId);
        
        if (orderItemsError) {
            console.error('Error inserting order items:', orderItemsError);
            // In a real app, you'd want to roll back the order creation here
            return NextResponse.json({ error: 'Failed to add order items.' }, { status: 500 });
        }

        // Clear the dealer's cart after successful order placement
        const { error: clearCartError } = await supabase
            .from('dealer_cart_items')
            .delete()
            .eq('dealer_id', dealerId);

        if (clearCartError) {
            console.warn('Error clearing cart after order placement:', clearCartError);
            // This is a warning, as the order was placed successfully
        }

        return NextResponse.json({ success: true, message: 'Order placed successfully!', orderId: newOrder.id });

    } catch (err) {
        console.error('Unexpected error placing order:', err);
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

