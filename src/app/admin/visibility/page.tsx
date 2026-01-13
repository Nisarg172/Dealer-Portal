'use client';

import apiClient from '@/lib/axios';
import DataTable from '@/components/common/Table/DataTable';
import { visibilityColumns, DealerVisibility } from './visibility.columns';

export default function AdminVisibilityPage() {
  /* -------------------------
     Fetcher (backend driven)
  -------------------------- */
  const fetchDealers = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
    filter: { key: string; value: string } | null;
  }) => {
    const res = await apiClient.get('/admin/dealers', { params });
    return res.data; // { data, meta }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Visibility Management
        </h1>
      </div>

      {/* Table */}
      <DataTable<DealerVisibility>
        columns={visibilityColumns()}
        fetcher={fetchDealers}
        defaultSortBy="name"
      />
    </div>
  );
}
