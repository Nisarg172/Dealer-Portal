  'use client';

  import Link from 'next/link';
  import apiClient from '@/lib/axios';
  import DataTable, { DataTableRef } from '@/components/common/Table/DataTable';
  import { Category, categoryColumns } from './category.columns';
import { useRef } from 'react';

  export default function AdminCategoriesPage() {
    const tableRef = useRef<DataTableRef>(null);

    /* -----------------------
      Backend Fetcher
    ------------------------ */
    const fetchCategories = async (params?: {
      search: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
      page: number;
      limit: number;
    }) => {
      const res = await apiClient.get('/admin/categories', { params });
      return res.data; // { data, meta }
    };

    const deleteCategories = async(id:string)=>{
       if (!confirm('Are you sure you want to delete this categorie?')) return;

    await apiClient.delete(`/admin/categories/${id}`);
    tableRef.current?.refresh();

    }

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
          columns={(categoryColumns(deleteCategories))}
          fetcher={fetchCategories}
          defaultSortBy="name"
          ref={tableRef}
        />
      </div>
    );
  }
