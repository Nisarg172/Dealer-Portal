'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { FiChevronLeft, FiFolder, FiSave, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

type EditCategoryFormInputs = {
  name: string;
};

type CategoryData = {
  id: string;
  name: string;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditCategoryFormInputs>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await apiClient.get(`/admin/categories/${id}`);
        const category: CategoryData = response.data.category;
        reset({
          name: category.name,
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch category details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCategory();
  }, [id, reset]);

  const onSubmit = async (data: EditCategoryFormInputs) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put(`/admin/categories/${id}`, data);
      if (response.data.success) {
        setSuccess('Category updated successfully!');
        setTimeout(() => router.push('/admin/categories'), 1000);
      } else {
        setError(response.data.error || 'Failed to update category.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <FiChevronLeft /> Back to Categories
        </button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Edit Category</h1>
        <p className="text-sm text-slate-500">Modify the category details and properties.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Category Name
            </label>
            <div className="group relative">
              <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
              <input
                type="text"
                {...register('name', { required: 'Category name is required' })}
                placeholder="e.g. Electronics"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            {errors.name && (
              <p className="ml-1 text-[10px] font-bold uppercase text-rose-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Alert Messaging */}
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-4 text-center text-xs font-bold uppercase tracking-widest ${
                error 
                  ? 'border-rose-100 bg-rose-50 text-rose-600' 
                  : 'border-emerald-100 bg-emerald-50 text-emerald-600'
              }`}
            >
              {error || success}
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}