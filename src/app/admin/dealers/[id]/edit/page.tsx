'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { ChevronLeft, Loader2, Save, User, Building, MapPin, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

type EditDealerFormInputs = {
  name: string;
  email: string;
  phone?: string;
  company_name: string;
  address: string;
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
      const response = await apiClient.put(`/admin/dealers/${id}`, data);
      if (response.data.success) {
        setSuccess('Dealer updated successfully!');
        router.push('/admin/dealers');
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading dealer details...</p>
      </div>
    );
  }

  if (error && !id) {
    return <div className="container mx-auto px-4 py-8 text-red-600 font-medium text-center">Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/dealers" className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 transition-colors">
            <ChevronLeft size={16} /> Back to List
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Dealer</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">Ref: {id}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => router.push('/admin/dealers')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
                Cancel
            </button>
            <button
                form="edit-dealer-form"
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20 transition-all"
            >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {submitting ? 'Updating...' : 'Save Changes'}
            </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <form id="edit-dealer-form" onSubmit={handleSubmit(onSubmit)} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Dealer Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Dealer Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Dealer name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              {errors.name && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.name.message}</p>}
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label htmlFor="company_name" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Company Name</label>
              <div className="relative group">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  id="company_name"
                  {...register('company_name', { required: 'Company name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              {errors.company_name && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.company_name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  id="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  id="phone"
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="address" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Physical Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <textarea
                  id="address"
                  {...register('address', { required: 'Address is required' })}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm resize-none"
                ></textarea>
              </div>
              {errors.address && <p className="text-[11px] text-red-500 font-medium ml-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Feedback Messages */}
          <div className="mt-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-xs font-medium text-center">
                {success}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}