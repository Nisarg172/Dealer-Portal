'use client';

import apiClient from '@/lib/axios';
import DataTable from '@/components/common/Table/DataTable';
import { orderColumns, Order } from './order.columns';

export default function AdminOrdersPage() {
  /* -------------------------
     Fetcher (backend driven)
  -------------------------- */
  const fetchOrders = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
    filter: { key: string; value: string } | null;
  }) => {
    const res = await apiClient.get('/admin/orders', { params });
    return res.data; // { data, meta }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Order Management
        </h1>
      </div>

      {/* Table */}
      <DataTable<Order>
        columns={orderColumns()}
        fetcher={fetchOrders}
        defaultSortBy="created_at"
      />
    </div>
  );
}
