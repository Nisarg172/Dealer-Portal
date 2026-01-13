'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';
import { FilterOption } from '@/components/common/Table/types';

export type Order = {
  id: string;
  dealer_name: string;
  dealer_company: string;
  dealer_email: string;
  dealer_phone: string | null;
  total_amount: number;
  order_status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  created_at: string;
};

export const orderStatusOptions: FilterOption[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

export const orderColumns = (): Column<Order>[] => [
  {
    label: 'Order ID',
    key: 'id',
  },
  {
    label: 'Dealer',
    key: 'dealer_name',
    sortable: true,
  },
  {
    label: 'Total Amount',
    key: 'total_amount',
    sortable: true,
    render: o => `₹${o.total_amount.toFixed(2)}`,
  },
  {
    label: 'Status',
    key: 'order_status',
    filterOption: orderStatusOptions,
    render: o => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          o.order_status === 'approved'
            ? 'bg-green-200 text-green-900'
            : o.order_status === 'rejected'
            ? 'bg-red-200 text-red-900'
            : 'bg-blue-200 text-blue-900'
        }`}
      >
        {o.order_status}
      </span>
    ),
  },
  {
    label: 'Order Date',
    key: 'created_at',
    sortable: true,
    render: o => new Date(o.created_at).toLocaleDateString(),
  },
  {
    label: 'Actions',
    render: o => (
      <Link
        href={`/admin/orders/${o.id}`}
        className="text-blue-600 hover:underline"
      >
        View
      </Link>
    ),
  },
];
