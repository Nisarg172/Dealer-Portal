'use client';

import Link from 'next/link';
import apiClient from '@/lib/axios';
import DataTable from '@/components/common/Table/DataTable';
import { Category, categoryColumns } from './category.columns';

export default function AdminCategoriesPage() {
  /* -----------------------
     Backend Fetcher
  ------------------------ */
  const fetchCategories = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    const res = await apiClient.get('/admin/categories', { params });
    return res.data; // { data, meta }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Category Management
        </h1>

        <Link
          href="/admin/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Category
        </Link>
      </div>

      {/* Table */}
      <DataTable<Category>
        columns={categoryColumns}
        fetcher={fetchCategories}
        defaultSortBy="name"
      />
    </div>
  );
}
