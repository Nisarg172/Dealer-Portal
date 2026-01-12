'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';

type EditDealerFormInputs = {
  name: string;
  email: string;
  phone?: string;
  company_name: string;
  address: string;
  // No password field here for editing, handle separately if needed for security
};

type DealerData = {
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

export default function EditDealerPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditDealerFormInputs>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const response = await apiClient.get(`/admin/dealers/${id}`);
        const dealer: DealerData = response.data.dealer; 
        reset({
          name: dealer.name,
          email: dealer.users.email,
          phone: dealer.users.phone || '',
          company_name: dealer.company_name,
          address: dealer.address,
        });
      } catch (err: any) {
        console.error('Error fetching dealer:', err);
        setError(err.response?.data?.error || 'Failed to fetch dealer details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDealer();
    }
  }, [id, reset]);

  const onSubmit = async (data: EditDealerFormInputs) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put(`/admin/dealers/${id}`, data); // Assuming PUT endpoint for update
      if (response.data.success) {
        setSuccess('Dealer updated successfully!');
        router.push('/admin/dealers'); // Redirect back to dealer list
      } else {
        setError(response.data.error || 'Failed to update dealer.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading dealer details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Dealer: {id}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Dealer Name</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Dealer name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
            <input
              type="text"
              id="phone"
              {...register('phone')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              id="company_name"
              {...register('company_name', { required: 'Company name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="address"
              {...register('address', { required: 'Address is required' })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Dealer'}
          </button>
        </form>
      </div>
    </div>
  );
}