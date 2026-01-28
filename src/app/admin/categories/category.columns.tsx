'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';

export type Category = {
  id: string;
  name: string;
};

export const categoryColumns = (
  onDelete: (id: string) => void
):Column<Category>[] => [
  {
    label: 'Name',
    key: 'name',
    sortable: true,
  },
  {
    label: 'Actions',
    render: (category) => (
      <div className="space-x-3">
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>

        <button
          onClick={() =>
            onDelete(category.id)
          }
          className="text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    ),
  },
];
