'use client';

import Link from 'next/link';
import apiClient from '@/lib/axios';
import DataTable, { FilterOption } from '@/components/common/Table/DataTable';
import { productColumns } from './product.columns';
import { Product } from './product.columns';
import { useEffect, useState } from 'react';
export default function AdminProductsPage() {

  const [categories, setCategories] =  useState<FilterOption[]>([]);
  /* -------------------------
     Fetcher (backend driven)
  -------------------------- */
  const fetchProducts = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
    filter: {key:string,value:string} | null;
  }) => {
    console.log('Fetcher Params:', params);
    const res = await apiClient.get('/admin/products', { params });
    return res.data; // { data, meta }
  };

  const fetchCatagorys = async () => {
    const res = await apiClient.get('/admin/categories');
    setCategories(res.data.data.map((cat: { id: string; name: string })=>({label:cat.name, value:cat.id})));

      
  }

  /* -------------------------
     Delete Handler
  -------------------------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    await apiClient.delete(`/admin/products/${id}`);
  };

  useEffect(() => {
    fetchCatagorys();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Product Management
        </h1>

        <Link
          href="/admin/products/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create New Product
        </Link>
      </div>

      {/* Table */}
      <DataTable<Product>
        columns={productColumns(handleDelete,categories)}
        fetcher={fetchProducts}
        defaultSortBy="name"
      />
    </div>
  );
}
