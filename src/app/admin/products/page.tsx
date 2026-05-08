'use client';

import Link from 'next/link';
import apiClient from '@/lib/axios';
import DataTable, { DataTableRef, FilterOption } from '@/components/common/Table/DataTable';
import { productColumns } from './product.columns';
import { Product } from './product.columns';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

type BulkUploadError = {
  row: number;
  message: string;
};

type BulkUploadResponse = {
  success: boolean;
  summary: {
    totalRows: number;
    imported: number;
    skipped: number;
    duplicatesSkipped: number;
    validationSkipped: number;
  };
  errors: BulkUploadError[];
};

type ApiClientError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};
export default function AdminProductsPage() {

  const [categories, setCategories] =  useState<FilterOption[]>([]);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);
  const [bulkUploadResult, setBulkUploadResult] = useState<BulkUploadResponse | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const tableRef = useRef<DataTableRef>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
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

  const handleBulkFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setBulkFile(selectedFile);
    setBulkUploadError(null);
    setBulkUploadResult(null);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkUploadError('Please select an Excel file before uploading.');
      return;
    }

    setIsBulkUploading(true);
    setBulkUploadError(null);
    setBulkUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      const res = await apiClient.post('/admin/products/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = res.data as BulkUploadResponse;
      setBulkUploadResult(result);

      if (result.summary.imported > 0) {
        tableRef.current?.refresh();
      }

      setBulkFile(null);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      const typedError = err as ApiClientError;
      setBulkUploadError(
        typedError.response?.data?.error || 'Bulk upload failed. Please try again.'
      );
    } finally {
      setIsBulkUploading(false);
    }
  };

  /* -------------------------
     Delete Handler
  -------------------------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    await apiClient.delete(`/admin/products/${id}`);
    tableRef.current?.refresh();
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
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <input
            ref={bulkFileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleBulkFileSelect}
            className="max-w-xs text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <button
            type="button"
            onClick={handleBulkUpload}
            disabled={isBulkUploading || !bulkFile}
            className="rounded bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isBulkUploading ? 'Uploading...' : 'Upload Excel'}
          </button>
          <Link
            href="/admin/products/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create New Product
          </Link>
        </div>
      </div>
      {/* <p className="mb-3 text-sm text-gray-600">
        Mandatory Excel columns: <strong>name</strong>, <strong>category_id</strong>, <strong>base_price</strong>, <strong>purchase_price</strong>. The <strong>category_id</strong> column accepts either category ID or category name.
      </p> */}
      {bulkUploadError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {bulkUploadError}
        </div>
      )}
      {bulkUploadResult && (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p>
            Processed {bulkUploadResult.summary.totalRows} rows: imported{' '}
            <strong>{bulkUploadResult.summary.imported}</strong>, skipped{' '}
            <strong>{bulkUploadResult.summary.skipped}</strong> (
            {bulkUploadResult.summary.duplicatesSkipped} duplicates,{' '}
            {bulkUploadResult.summary.validationSkipped} validation failures).
          </p>
          {bulkUploadResult.errors.length > 0 && (
            <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-xs text-emerald-900">
              {bulkUploadResult.errors.slice(0, 12).map((item, index) => (
                <li key={`${item.row}-${index}`}>
                  Row {item.row}: {item.message}
                </li>
              ))}
              {bulkUploadResult.errors.length > 12 && (
                <li>
                  ...and {bulkUploadResult.errors.length - 12} more skipped rows.
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable<Product>
        columns={productColumns(handleDelete,categories)}
        fetcher={fetchProducts}
        defaultSortBy="name"
        ref={tableRef}
      />
    </div>
  );
}
