'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';
import { Pencil, Trash2 } from 'lucide-react'; // Import the icons

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
        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
          dealer.users.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {dealer.users.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    label: 'Actions',
    render: (dealer, refresh) => ( // refresh is passed from DataTable
      <div className="flex items-center gap-2">
        {/* Edit Icon */}
        <Link
          href={`/admin/dealers/${dealer.id}/edit`}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/edit"
          title="Edit Dealer"
        >
          <Pencil size={18} className="group-hover/edit:scale-110 transition-transform" />
        </Link>

        {/* Delete/Toggle Status Icon */}
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to ${dealer.users.is_active ? 'deactivate' : 'activate'} this dealer?`)) {
              // Your API logic here
              alert(`Toggled dealer ${dealer.id}`);
              refresh(); // Refresh the table data
            }
          }}
          className={`p-2 rounded-lg transition-colors group/del ${
            dealer.users.is_active 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={dealer.users.is_active ? 'Deactivate' : 'Activate'}
        >
          <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
        </button>
      </div>
    ),
  },
];