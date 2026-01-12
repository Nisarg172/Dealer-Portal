'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';

type Dealer = {
  id: string;
  name: string;
  company_name: string;
  users: {
    email: string;
  };
};

export default function AdminVisibilityPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/dealers'); // Reuse the existing dealers API
      setDealers(response.data.dealers);
    } catch (err: any) {
      console.error('Error fetching dealers for visibility:', err);
      setError(err.response?.data?.error || 'Failed to fetch dealers for visibility management.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading dealers for visibility management...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Visibility Management</h1>
      
      {dealers.length === 0 ? (
        <p className="text-gray-700">No dealers found. Please create dealers first to manage visibility.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dealer Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer) => (
                <tr key={dealer.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.company_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.users.email}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/visibility/${dealer.id}`} className="text-blue-600 hover:text-blue-900">Manage Visibility</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}