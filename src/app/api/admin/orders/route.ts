import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';




// GET /api/admin/orders - Fetch all orders
export async function GET(req: NextRequest) {

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        total_amount,
        order_status,
        created_at,
        dealers ( name, company_name, users ( email, phone ) )
        `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedOrders = orders.map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        order_status: order.order_status,
        created_at: order.created_at,
        dealer_name: order.dealers?.name || 'N/A',
        dealer_company: order.dealers?.company_name || 'N/A',
        dealer_email: order.dealers?.users?.email || 'N/A',
        dealer_phone: order.dealers?.users?.phone || null,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (err) {
    console.error('Unexpected error fetching orders:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

