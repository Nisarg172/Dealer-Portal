import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;



// GET /api/admin/orders/[id] - Fetch details for a single order
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  const orderId = params.id;

  try {
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        total_amount,
        order_status,
        created_at,
        dealers ( name, company_name, users ( email, phone ) ),
        order_items ( product_id, quantity, price_at_order, products ( name ) )
        `
      )
      .eq('id', orderId)
      .single();

    if (error || !orderData) {
      console.error('Error fetching order details:', error);
      return NextResponse.json({ error: 'Order not found or database error.' }, { status: 404 });
    }

    const formattedOrder = {
      id: orderData.id,
      total_amount: orderData.total_amount,
      order_status: orderData.order_status,
      created_at: orderData.created_at,
      dealer_name: orderData.dealers?.name || 'N/A',
      dealer_email: orderData.dealers?.users?.email || 'N/A',
      dealer_phone: orderData.dealers?.users?.phone || null,
      order_items: orderData.order_items.map(item => ({
        product_name: item.products?.name || 'N/A',
        quantity: item.quantity,
        price_at_order: item.price_at_order,
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (err) {
    console.error('Unexpected error fetching order details:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

