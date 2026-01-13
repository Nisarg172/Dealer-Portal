'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';
import { FilterOption } from '@/components/common/Table/types';
export type Product = {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
  categories: {
    id: string;
    name: string;
  } | null;
};


export const productColumns = (
  onDelete: (id: string) => void,
  categories: FilterOption[]
): Column<Product>[] => [
  {
    label: 'Name',
    key: 'name',
    sortable: true,
  },
  {
    label: 'Category',
    key: `categories.id` as keyof Product,
    render: (product) => product.categories?.name ?? '—',
    filterOption: categories,
    
  },
  {
    label: 'Base Price',
    key: 'base_price',
    sortable: true,
    render: (product) => `₹${product.base_price.toFixed(2)}`,
  },
  {
    label: 'Status',
    render: (product) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          product.is_active
            ? 'bg-green-200 text-green-900'
            : 'bg-red-200 text-red-900'
        }`}
      >
        {product.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    label: 'Actions',
    render: (product) => (
      <div className="space-x-3">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>

        <button
          onClick={() => onDelete(product.id)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
  },
];
