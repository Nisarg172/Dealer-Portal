'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';
import { FilterOption } from '@/components/common/Table/types';
import { ReactNode } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi'; // Added icons

export type Product = {
  category_name: ReactNode;
  image_url: string;
  discounted_price: number;
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
      <div className="flex items-center gap-4">
        {/* Edit Icon Button */}
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="text-blue-500 hover:text-blue-700 transition-colors"
          title="Edit"
        >
          <FiEdit2 size={18} />
        </Link>

        {/* Delete Icon Button */}
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete ${product.name}?`)) {
              onDelete(product.id);
            }
          }}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Delete"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    ),
  },
];