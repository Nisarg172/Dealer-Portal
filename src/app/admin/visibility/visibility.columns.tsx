'use client';

import Link from 'next/link';
import { Column } from '@/components/common/Table/DataTable';

export type DealerVisibility = {
  id: string;
  name: string;
  company_name: string;
  email: string;
};

export const visibilityColumns = (): Column<DealerVisibility>[] => [
  {
    label: 'Dealer Name',
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
    key: 'email',
  },
  {
    label: 'Actions',
    render: dealer => (
      <Link
        href={`/admin/visibility/${dealer.id}`}
        className="text-blue-600 hover:underline"
      >
        Manage Visibility
      </Link>
    ),
  },
];
