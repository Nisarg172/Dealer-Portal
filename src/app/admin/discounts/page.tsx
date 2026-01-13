'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import CommonTable from '@/components/common/Table/DataTable';
import DataTable from '@/components/common/Table/DataTable';
import { discountDealerColumns } from './discountDealer.columns';

export default function AdminDiscountsPage() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);



  const fetchDealers = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
    filter: {key:string,value:string} | null;
  }) => {
    console.log('Fetcher Params:', params);
    const res = await apiClient.get('/admin/dealers', { params });
    return res.data; 
  };



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Discount Management</h1>

      

       <DataTable
              columns={discountDealerColumns}
              fetcher={fetchDealers}
              defaultSortBy="name"
            />
    </div>
  );
}
