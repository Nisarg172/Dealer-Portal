'use client';

import Link from 'next/link';
import apiClient from '@/lib/axios';
import DataTable, { Column } from '@/components/common/Table/DataTable';
import { dealerColumns } from './dealer.columns';

/* =======================
   Types
======================= */

type Dealer = {
  id: string;
  name: string;
  company_name: string;
  address: string;
  users: {
    email: string;
    phone: string | null;
    is_active: boolean;
  };
};

/* =======================
   Page Component
======================= */

export default function AdminDealersPage() {
  /* -----------------------
     Backend Fetcher
  ------------------------ */
  const fetchDealers = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    const res = await apiClient.get('/admin/dealers', { params });
    return res.data; // must return { data, meta }
  };


  /* -----------------------
     Render
  ------------------------ */
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dealer Management
        </h1>

        <Link
          href="/admin/dealers/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Dealer
        </Link>
      </div>

      {/* Table */}
      <DataTable
        columns={dealerColumns}
        fetcher={fetchDealers}
        defaultSortBy="name"
      />
    </div>
  );
}
