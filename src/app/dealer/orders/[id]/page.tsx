'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';

type OrderItem = {
  id: string;
  quantity: number;
  price_at_order: number;
  product: {
    id: string;
    name: string;
  };
};

type OrderDetail = {
  id: string;
  order_number: string;
  status: 'pending' | 'approved' | 'rejected';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
};

export default function DealerOrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------
     FETCH ORDER DETAILS
  ---------------------------------------- */
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/dealer/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  /* ----------------------------------------
     UI STATES
  ---------------------------------------- */
  if (loading) {
    return <p className="p-6 text-gray-600">Loading order details...</p>;
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link href="/dealer/orders" className="text-blue-600 underline mt-4 block">
          Back to orders
        </Link>
      </div>
    );
  }

  /* ----------------------------------------
     STATUS BADGE
  ---------------------------------------- */
  const statusColor =
    order.status === 'approved'
      ? 'bg-green-100 text-green-700'
      : order.status === 'rejected'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Order #{order.order_number}
        </h1>
        <Link
          href="/dealer/orders"
          className="text-blue-600 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500">Order Date</p>
          <p className="font-medium">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusColor}`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>

        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.product.name}</td>
                  <td className="p-3">
                    ₹{item.price_at_order.toFixed(2)}
                  </td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3 font-medium">
                    ₹{(item.price_at_order * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Total */}
        <div className="flex justify-end mt-6">
          <p className="text-xl font-bold">
            Grand Total: ₹{order.total_amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
