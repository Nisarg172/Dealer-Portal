import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;



// GET /api/admin/orders/[id] - Fetch details for a single order
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        order_status,
        created_at,
        subtotal,
        gst_amount,
        dealers (
          name,
          users ( email, phone )
        ),
        order_items (
          quantity,
          price_at_order,
          products ( name )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: data.id,
        total_amount: data.total_amount,
        order_status: data.order_status,
        created_at: data.created_at,
        dealer_name: data.dealers?.name ?? 'N/A',
        dealer_email: data.dealers?.users?.email ?? 'N/A',
        dealer_phone: data.dealers?.users?.phone ?? null,
        subtotal: data.subtotal,
        gst_amount: data.gst_amount,
        order_items: data?.order_items?.map((item) => ({
          product_name: item.products?.name ?? 'N/A',
          quantity: item.quantity,
          price_at_order: item.price_at_order,
        })),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// PUT /api/admin/orders/[id] - Update order status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  
  const orderId = params.id;
  const { order_status } = await req.json();

  if (!order_status) {
    return NextResponse.json({ error: 'Order status is required.' }, { status: 400 });
  }

  // Validate status against allowed values (optional, but good practice)
  const allowedStatuses = ['pending', 'approved', 'rejected', 'shipped', 'delivered'];
  if (!allowedStatuses.includes(order_status)) {
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
  }

  try {
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ order_status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !updatedOrder) {
      console.error('Error updating order status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error updating order status:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

