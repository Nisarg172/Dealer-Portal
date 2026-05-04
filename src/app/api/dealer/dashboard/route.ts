import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getAdminIdFromAuth();
    const dealerId = payload?.dealers?.id;

    if (!dealerId || payload?.role !== 'dealer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [spendResult, cartResult, recentOrdersResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount')
        .eq('dealer_id', dealerId)
        .is('deleted_at', null)
        .in('order_status', ['pending', 'approved']),
      supabase
        .from('dealer_cart_items')
        .select('quantity, price_at_addition')
        .eq('dealer_id', dealerId),
      supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_status,
          created_at,
          order_items (
            quantity,
            products ( name )
          )
        `)
        .eq('dealer_id', dealerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (spendResult.error) {
      return NextResponse.json({ error: spendResult.error.message }, { status: 500 });
    }
    if (cartResult.error) {
      return NextResponse.json({ error: cartResult.error.message }, { status: 500 });
    }
    if (recentOrdersResult.error) {
      return NextResponse.json({ error: recentOrdersResult.error.message }, { status: 500 });
    }

    const spendOrders = spendResult.data || [];
    const cartItems = cartResult.data || [];
    const recentOrdersRaw = recentOrdersResult.data || [];

    const totalSpend = spendOrders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
    const activeOrders = spendOrders.length;

    const cartValue = cartItems.reduce(
      (sum, item) => sum + Number(item.price_at_addition || 0) * Number(item.quantity || 0),
      0
    );
    const cartItemsCount = cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const recentOrders = recentOrdersRaw.map((order) => {
      const items = order.order_items || [];
      const firstProduct = items[0]?.products?.name || 'Order items';
      const moreCount = Math.max(items.length - 1, 0);
      const product = moreCount > 0 ? `${firstProduct} +${moreCount} more` : firstProduct;

      return {
        id: order.id,
        product,
        created_at: order.created_at,
        status: order.order_status,
        amount: Number(order.total_amount || 0),
      };
    });

    return NextResponse.json({
      stats: {
        totalSpend,
        activeOrders,
        cartValue,
        cartItemsCount,
      },
      recentOrders,
    });
  } catch (err) {
    console.error('Unexpected error fetching dealer dashboard data:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
