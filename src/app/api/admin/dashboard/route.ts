import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminIdFromAuth } from '../../utils/functions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LiveFeedItem = {
  id: string;
  user: string;
  action: string;
  created_at: string | null;
};

const toTimestamp = (value: string | null) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export async function GET() {
  try {
    const payload = await getAdminIdFromAuth();
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      dealersCountResult,
      productsCountResult,
      recentOrdersCountResult,
      revenueResult,
      recentOrdersResult,
      recentProductsResult,
      recentDealersResult,
    ] =
      await Promise.all([
        supabase
          .from('dealers')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase
          .from('orders')
          .select('total_amount')
          .is('deleted_at', null)
          .eq('order_status', 'approved'),
        supabase
          .from('orders')
          .select(`
            id,
            created_at,
            order_status,
            dealers ( name )
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('products')
          .select('id, name, created_at')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('dealers')
          .select('id, name, company_name, created_at')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

    if (dealersCountResult.error) {
      return NextResponse.json({ error: dealersCountResult.error.message }, { status: 500 });
    }
    if (productsCountResult.error) {
      return NextResponse.json({ error: productsCountResult.error.message }, { status: 500 });
    }
    if (recentOrdersCountResult.error) {
      return NextResponse.json({ error: recentOrdersCountResult.error.message }, { status: 500 });
    }
    if (revenueResult.error) {
      return NextResponse.json({ error: revenueResult.error.message }, { status: 500 });
    }
    if (recentOrdersResult.error) {
      return NextResponse.json({ error: recentOrdersResult.error.message }, { status: 500 });
    }
    if (recentProductsResult.error) {
      return NextResponse.json({ error: recentProductsResult.error.message }, { status: 500 });
    }
    if (recentDealersResult.error) {
      return NextResponse.json({ error: recentDealersResult.error.message }, { status: 500 });
    }

    const revenue = (revenueResult.data || []).reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );

    const orderActivities: LiveFeedItem[] = (recentOrdersResult.data || []).map((order) => {
      const dealerName = order.dealers?.name || 'Dealer';
      const orderLabel = order.id.slice(0, 8).toUpperCase();
      const statusLabel = order.order_status
        ? `${order.order_status.charAt(0).toUpperCase()}${order.order_status.slice(1)}`
        : 'Updated';

      return {
        id: `order-${order.id}`,
        user: dealerName,
        action: `placed order #${orderLabel} (${statusLabel})`,
        created_at: order.created_at,
      };
    });

    const productActivities: LiveFeedItem[] = (recentProductsResult.data || []).map((product) => ({
      id: `product-${product.id}`,
      user: 'Admin',
      action: `added new product ${product.name}`,
      created_at: product.created_at,
    }));

    const dealerActivities: LiveFeedItem[] = (recentDealersResult.data || []).map((dealer) => ({
      id: `dealer-${dealer.id}`,
      user: dealer.name || 'New Dealer',
      action: dealer.company_name
        ? `joined with company ${dealer.company_name}`
        : 'joined the platform',
      created_at: dealer.created_at,
    }));

    const liveFeed = [...orderActivities, ...productActivities, ...dealerActivities]
      .sort((a, b) => toTimestamp(b.created_at) - toTimestamp(a.created_at))
      .slice(0, 8);

    return NextResponse.json({
      stats: {
        totalDealers: dealersCountResult.count ?? 0,
        totalProducts: productsCountResult.count ?? 0,
        recentOrders: recentOrdersCountResult.count ?? 0,
        revenue,
      },
      liveFeed,
    });
  } catch (err) {
    console.error('Unexpected error fetching admin dashboard data:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
