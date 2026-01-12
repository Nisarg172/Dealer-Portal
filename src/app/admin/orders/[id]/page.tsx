'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/axios';

type OrderItem = {
  product_name: string;
  quantity: number;
  price_at_order: number; // Price after discount at the time of order
};

type OrderDetails = {
  id: string;
  dealer_name: string;
  dealer_email: string;
  dealer_phone: string | null;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  created_at: string;
  order_items: OrderItem[];
};

const statusOptions: OrderDetails['status'][] = ['pending', 'approved', 'rejected', 'shipped', 'delivered'];

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id: orderId } = params as { id: string };

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderDetails['status'] | ''>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/admin/orders/${orderId}`); // Assuming GET /api/admin/orders/[id] exists
        setOrderDetails(response.data.order);
        setCurrentStatus(response.data.order.status);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.error || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderDetails['status']) => {
    if (updatingStatus) return;
    if (!confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(true);
    setError(null);
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { status: newStatus }); // Assuming PUT /api/admin/orders/[id] for status update
      setOrderDetails(prev => prev ? { ...prev, status: newStatus } : null);
      setCurrentStatus(newStatus);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading order details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div className="container mx-auto px-4 py-8 text-gray-700">Order not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details: {orderDetails.id}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Dealer Information</h2>
        <p><strong>Name:</strong> {orderDetails.dealer_name}</p>
        <p><strong>Email:</strong> {orderDetails.dealer_email}</p>
        <p><strong>Phone:</strong> {orderDetails.dealer_phone || 'N/A'}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
        <p><strong>Order Date:</strong> {new Date(orderDetails.created_at).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹{orderDetails.total_amount.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <p className="mr-2"><strong>Status:</strong></p>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as OrderDetails['status'])}
            disabled={updatingStatus}
            className="border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          {updatingStatus && <span className="ml-2 text-sm text-blue-600">Updating...</span>}
          {error && <p className="text-sm text-red-600 ml-4">{error}</p>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items</h2>
        {orderDetails.order_items.length === 0 ? (
          <p className="text-gray-700">No items in this order.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price at Order</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.order_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.product_name}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{item.quantity}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{item.price_at_order.toFixed(2)}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{(item.quantity * item.price_at_order).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
