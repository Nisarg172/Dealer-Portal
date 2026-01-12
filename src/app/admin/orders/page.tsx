'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';

type Order = {
  id: string;
  dealer_name: string; // Assuming we can get dealer name from the order or join
  total_amount: number;
  order_status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered'; // Example statuses
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/orders'); // Assuming GET /api/admin/orders exists
      setOrders(response.data.orders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['order_status']) => {
    if (!confirm(`Are you sure you want to change status of order ${orderId} to ${newStatus}?`)) {
      return;
    }
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { order_status: newStatus }); // Assuming PUT /api/admin/orders/[id] for status update
      fetchOrders(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-700">No orders found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dealer</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.id}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{order.dealer_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{order.total_amount.toFixed(2)}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${order.order_status === 'approved' ? 'text-green-900' : order.order_status === 'rejected' ? 'text-red-900' : 'text-blue-900'}`}>
                      <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${order.order_status === 'approved' ? 'bg-green-200' : order.order_status === 'rejected' ? 'bg-red-200' : 'bg-blue-200'}`}></span>
                      <span className="relative">{order.order_status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 mr-3">View Details</Link>
                    {/* Dropdown for status update could be more elegant */}
                    <select
                      value={order.order_status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['order_status'])}
                      className="ml-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}