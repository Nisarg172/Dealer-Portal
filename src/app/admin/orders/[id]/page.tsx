'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { FiArrowLeft } from 'react-icons/fi';

/* -------------------- Types -------------------- */
type OrderItem = {
  product_name: string;
  quantity: number;
  price_at_order: number;
};

type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered';

type OrderDetails = {
  id: string;
  dealer_name: string;
  dealer_email: string;
  dealer_phone: string | null;

  subtotal: number;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;

  order_status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};

/* -------------------- Constants -------------------- */
const statusOptions: OrderStatus[] = [
  'pending',
  'approved',
  'rejected',
  'delivered',
];

const statusColor = (status: OrderStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/* -------------------- Page -------------------- */
export default function AdminOrderDetailsPage() {
  const { id: orderId } = useParams() as { id: string };
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [currentStatus, setCurrentStatus] =
    useState<OrderStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------- Fetch Order -------------------- */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.get(`/admin/orders/${orderId}`);
        setOrder(res.data.order);
        setCurrentStatus(res.data.order.order_status);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  /* -------------------- Update Status -------------------- */
  const handleStatusChange = async (status: OrderStatus) => {
    if (!confirm(`Change order status to ${status.toUpperCase()}?`)) return;

    setUpdatingStatus(true);
    try {
      await apiClient.put(`/admin/orders/${orderId}`, {
        order_status: status,
      });

      setCurrentStatus(status);
      setOrder((prev) =>
        prev ? { ...prev, order_status: status } : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* -------------------- States -------------------- */
  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (error)
    return (
      <div className="p-10 text-center text-red-600">{error}</div>
    );

  if (!order)
    return (
      <div className="p-10 text-center">Order not found</div>
    );

  /* -------------------- UI -------------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
       <button
        onClick={() => router.back()}
        className="mb-2 inline-flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-blue-600 transition"
      >
        <FiArrowLeft className="text-lg" />
        Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{order.id}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <span
          className={`px-4 py-1 rounded-full text-sm font-medium ${statusColor(
            order.order_status
          )}`}
        >
          {order.order_status.toUpperCase()}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Dealer */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Dealer</h3>
          <p>{order.dealer_name}</p>
          <p>{order.dealer_email}</p>
          <p>{order.dealer_phone || 'N/A'}</p>
        </div>

        {/* Price Summary */}
        <div className="bg-white p-6 rounded-xl shadow space-y-2">
          <h3 className="font-semibold mb-3">Price Summary</h3>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>GST ({order.gst_percentage}%)</span>
            <span>₹{order.gst_amount.toFixed(2)}</span>
          </div>

          <div className="border-t pt-2 flex justify-between font-bold text-green-600">
            <span>Total</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Update Status</h3>
          <select
            value={currentStatus}
            disabled={updatingStatus}
            onChange={(e) =>
              handleStatusChange(e.target.value as OrderStatus)
            }
            className="w-full border rounded px-3 py-2"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Product</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.order_items.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-3">
                  {item.product_name}
                </td>
                <td className="px-6 py-3 text-center">
                  {item.quantity}
                </td>
                <td className="px-6 py-3 text-right">
                  ₹{item.price_at_order.toFixed(2)}
                </td>
                <td className="px-6 py-3 text-right font-semibold">
                  ₹{(item.quantity * item.price_at_order).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals */}
          <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right">
                Subtotal
              </td>
              <td className="px-6 py-3 text-right">
                ₹{order.subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right">
                GST ({order.gst_percentage}%)
              </td>
              <td className="px-6 py-3 text-right">
                ₹{order.gst_amount.toFixed(2)}
              </td>
            </tr>
            <tr className="text-green-600">
              <td colSpan={3} className="px-6 py-3 text-right">
                Total Payable
              </td>
              <td className="px-6 py-3 text-right">
                ₹{order.total_amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

