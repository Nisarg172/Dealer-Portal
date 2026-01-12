'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Dealer = {
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

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/dealers');
      setDealers(response.data.dealers);
    } catch (err: any) {
      console.error('Error fetching dealers:', err);
      setError(err.response?.data?.error || 'Failed to fetch dealers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleToggleActive = async (dealerId: string, currentStatus: boolean) => {
    // This will require a new API endpoint, e.g., PUT /api/admin/dealers/[id]/toggle-active
    // For now, this is a placeholder.
    alert(`Toggle active for dealer ${dealerId} from ${currentStatus} to ${!currentStatus}`);
    // After API call, refetch dealers to update UI
    // await apiClient.put(`/admin/dealers/${dealerId}/toggle-active`, { isActive: !currentStatus });
    // fetchDealers();
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading dealers...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dealer Management</h1>
      <div className="flex justify-end mb-4">
        <Link href="/admin/dealers/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Dealer
        </Link>
      </div>
      
      {dealers.length === 0 ? (
        <p className="text-gray-700">No dealers found. Create a new dealer to get started.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer) => (
                <tr key={dealer.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.company_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.users?.email}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{dealer.users?.phone || 'N/A'}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${dealer.users?.is_active ? 'text-green-900' : 'text-red-900'}`}>
                      <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${dealer.users?.is_active ? 'bg-green-200' : 'bg-red-200'}`}></span>
                      <span className="relative">{dealer.users?.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/dealers/${dealer.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Edit</Link>
                    <button 
                      onClick={() => handleToggleActive(dealer.id, dealer.users?.is_active)}
                      className={`text-sm font-medium ${dealer.users?.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {dealer.users?.is_active ? 'Deactivate' : 'Activate'}
                    </button>
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