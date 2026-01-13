'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';

/* =======================
   Dealer Type
======================= */
export type Dealer = {
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
   Column Config
======================= */
export const dealerColumns: Column<Dealer>[] = [
  {
    label: 'Name',
    key: 'name',
    sortable: true,
  },
  {
    label: 'Company',
    key: 'company_name',
    sortable: true,
  },
  {
    label: 'Email',
    render: (dealer) => dealer.users.email,
  },
  {
    label: 'Phone',
    render: (dealer) => dealer.users.phone || 'N/A',
  },
  {
    label: 'Status',
    render: (dealer) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          dealer.users.is_active
            ? 'bg-green-200 text-green-900'
            : 'bg-red-200 text-red-900'
        }`}
      >
        {dealer.users.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    label: 'Actions',
    render: (dealer) => (
      <div className="space-x-3">
        <Link
          href={`/admin/dealers/${dealer.id}/edit`}
          className="text-blue-600 hover:underline"
        >
          Edit
        </Link>

        <button
          onClick={() =>
            alert(
              `Toggle dealer ${dealer.id} to ${!dealer.users.is_active}`
            )
          }
          className={
            dealer.users.is_active
              ? 'text-red-600 hover:underline'
              : 'text-green-600 hover:underline'
          }
        >
          {dealer.users.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    ),
  },
];
