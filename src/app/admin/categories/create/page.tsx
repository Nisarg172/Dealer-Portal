'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { useState } from 'react';
import { FiChevronLeft, FiFolderPlus, FiPlusCircle, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

type CreateCategoryFormInputs = {
  name: string;
};

export default function CreateCategoryPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCategoryFormInputs>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: CreateCategoryFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.post('/admin/categories', data);
      if (response.data.success) {
        setSuccess('Category created successfully!');
        reset();
        // Short delay before redirect so user sees the success message
        setTimeout(() => router.push('/admin/categories'), 1000);
      } else {
        setError(response.data.error || 'Failed to create category.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <Link 
          href="/admin/categories" 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <FiChevronLeft /> Back to Categories
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Category</h1>
        <p className="text-slate-500 text-sm">Define a new category for your product organization.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Category Name
            </label>
            <div className="relative group">
              <FiFolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                {...register('name', { required: 'Category name is required' })}
                placeholder="e.g. Winter Collection"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            {errors.name && (
              <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tighter">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Feedback Messages */}
          {(error || success) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest border ${
                error 
                  ? 'bg-rose-50 text-rose-600 border-rose-100' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
            >
              {error || success}
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiPlusCircle />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}