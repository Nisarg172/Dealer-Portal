'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';
import { FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';

export type Category = {
  id: string;
  name: string;
};

export const categoryColumns = (
  onDelete: (id: string) => void
): Column<Category>[] => [
  {
    label: 'Category Name',
    key: 'name',
    sortable: true,
    render: (category) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FiFolder size={16} />
        </div>
        <span className="font-medium text-slate-700 capitalize">
          {category.name}
        </span>
      </div>
    )
  },
  {
    label: 'Actions',
    render: (category) => (
      <div className="flex items-center gap-4">
        {/* Edit Button - Matches Blue Icon in Dealer Table */}
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="text-blue-500 hover:text-blue-700 transition-colors p-1"
          title="Edit"
        >
          <FiEdit2 size={20} />
        </Link>

        {/* Delete Button - Matches Red Icon in Dealer Table */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this category?')) {
              onDelete(category.id);
            }
          }}
          className="text-red-500 hover:text-red-700 transition-colors p-1"
          title="Delete"
        >
          <FiTrash2 size={20} />
        </button>
      </div>
    ),
  },
];