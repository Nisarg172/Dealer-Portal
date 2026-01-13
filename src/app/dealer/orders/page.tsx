'use client';

import apiClient from '@/lib/axios';
import DataTable from '@/components/common/Table/DataTable';
import { dealerOrderColumns, DealerOrder } from './order.columns';

export default function DealerOrdersPage() {
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
    const res = await apiClient.get('/dealer/orders', { params });
    return res.data; // { data, meta }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Your Orders
        </h1>
      </div>

      {/* Table */}
      <DataTable<DealerOrder>
        columns={dealerOrderColumns()}
        fetcher={fetchOrders}
        defaultSortBy="created_at"
      />
    </div>
  );
}
