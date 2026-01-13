import { Column } from '@/components/common/Table/DataTable';
import Link from 'next/link';
import React from 'react';

export type Dealer = {
  id: string;
  name: string;
  company_name: string;
  users: {
    email: string;
  };
};

export const discountDealerColumns: Column<Dealer>[] = [
  {
    key: 'name',
    label: 'Dealer Name',
    sortable: true,
  },
  {
    key: 'company_name',
    label: 'Company',
    sortable: true,
  },
  {
    key: 'users.email' as keyof Dealer,
    label: 'Email',
    render: (row) => row.users.email,
  },
  {
    label: 'Actions',
    render: (row) => React.createElement(Link, {
      href: `/admin/discounts/${row.id}`,
      className: "text-blue-600 hover:text-blue-900 font-medium",
    }, "Manage Discounts"),
  },
];
