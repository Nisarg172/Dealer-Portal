'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { useState } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiBriefcase, 
  FiMapPin, FiLock, FiPlusCircle, FiLoader, FiChevronLeft 
} from 'react-icons/fi';
import Link from 'next/link';

type CreateDealerFormInputs = {
  name: string;
  email: string;
  phone?: string;
  company_name: string;
  address: string;
  password: string;
};

export default function CreateDealerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateDealerFormInputs>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: CreateDealerFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.post('/admin/dealers', data);
      if (response.data.success) {
        setSuccess('Dealer created successfully!');
        reset();
        router.push('/admin/dealers');
      } else {
        setError(response.data.error || 'Failed to create dealer.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            href="/admin/dealers" 
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2"
          >
            <FiChevronLeft /> Back to Dealers
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Dealer</h1>
          <p className="text-slate-500 text-sm">Register a new partner account to the system.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dealer Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Dealer Name</label>
              <div className="relative group">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  {...register('name', { required: 'Dealer name is required' })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Phone (Optional)</label>
              <div className="relative group">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
              <div className="relative group">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  {...register('company_name', { required: 'Company name is required' })}
                  placeholder="Acme Corp"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              {errors.company_name && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.company_name.message}</p>}
            </div>

            {/* Password */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Account Password</label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required', 
                    minLength: { value: 6, message: 'Minimum 6 characters' } 
                  })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.password.message}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Physical Address</label>
              <div className="relative group">
                <FiMapPin className="absolute left-3 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  rows={3}
                  placeholder="Enter full business address..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm resize-none"
                ></textarea>
              </div>
              {errors.address && <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase">{errors.address.message}</p>}
            </div>
          </div>

          {/* Alert Messages */}
          {(error || success) && (
            <div className={`p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest ${
              error ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              {error || success}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <FiPlusCircle />
                  Create Dealer Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}