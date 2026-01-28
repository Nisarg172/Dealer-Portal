import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
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
        console.error('Error fetching dealer data in dealer order detail API:', dealerError);
        return null;
      }
      return dealerData.id; 
    } catch (error) {
      console.error('Error verifying token in dealer order detail API:', error);
      return null;
    }
}

// GET /api/dealer/orders/[id] - Fetch details for a single order placed by a dealer
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const dealerId = await getDealerIdFromAuth();
  if (!dealerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
        order_items ( product_id, quantity, price_at_order, products ( name ) )
        `
      )
      .eq('id', orderId)
      .eq('dealer_id', dealerId) // Ensure dealer can only fetch their own orders
      .single();

    if (error || !orderData) {
      console.error('Error fetching dealer order details:', error);
      return NextResponse.json({ error: 'Order not found or database error.' }, { status: 404 });
    }

    const formattedOrder = {
      id: orderData.id,
      total_amount: orderData.total_amount,
      order_status: orderData.order_status,
      created_at: orderData.created_at,
      order_items: orderData.order_items.map(item => ({
        product_name: item.products?.name || 'N/A',
        quantity: item.quantity,
        price_at_order: item.price_at_order,
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (err) {
    console.error('Unexpected error fetching dealer order details:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


