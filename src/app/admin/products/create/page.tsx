'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { useState, useEffect } from 'react';
import { 
  FiChevronLeft, FiBox, FiTag, FiDollarSign, 
  FiInfo, FiImage, FiFileText, FiGlobe, 
  FiActivity, FiPlusCircle, FiLoader 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

type CreateProductFormInputs = {
  name: string;
  category_id: string;
  base_price: number;
  description: string;
  status: 'active' | 'inactive';
  product_image: FileList;
  datasheet_url: string;
  product_url: string;
};

type Category = {
  id: string;
  name: string;
};

export default function CreateProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateProductFormInputs>();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Watch for image changes to generate a preview
  const productImage = watch('product_image');
  useEffect(() => {
    if (productImage && productImage.length > 0) {
      const file = productImage[0];
      setPreview(URL.createObjectURL(file));
    }
  }, [productImage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/admin/categories');
        setCategories(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load categories');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: CreateProductFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category_id', data.category_id);
      formData.append('base_price', data.base_price.toString());
      formData.append('description', data.description);
      formData.append('status', data.status);
      formData.append('datasheet_url', data.datasheet_url);
      formData.append('product_url', data.product_url);

      if (data.product_image?.[0]) {
        formData.append('product_image', data.product_image[0]);
      }

      const res = await apiClient.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        reset();
        router.push('/admin/products');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="flex h-96 items-center justify-center">
        <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/products" 
          className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <FiChevronLeft /> Back to Inventory
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Add New Product</h1>
        <p className="text-sm text-slate-500">Create a new entry in your product catalog.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          >
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
              <div className="relative group">
                <FiBox className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  {...register('name', { required: 'Product name is required' })}
                  placeholder="e.g. Ultra HD Smart TV"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
              <div className="relative group">
                <FiInfo className="absolute left-3 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <textarea
                  rows={4}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Detailed product specifications and features..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    {...register('category_id', { required: 'Category is required' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 appearance-none transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Base Price (INR)</label>
                <div className="relative group">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                  <input
                    type="number" step="0.01"
                    {...register('base_price', { required: true, valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          >
            <h2 className="text-sm font-bold text-slate-800">Resource Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Datasheet URL</label>
                <div className="relative group">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('datasheet_url')} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">External Web URL</label>
                <div className="relative group">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input {...register('product_url')} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Status Selection */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Visibility Status</label>
            <div className="relative">
              <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                {...register('status', { required: true })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-bold outline-none focus:border-indigo-500 appearance-none transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </motion.div>

          {/* Media Upload */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Thumbnail Image</label>
            
            <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center transition-colors hover:bg-slate-100 group">
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <FiImage className="mx-auto text-slate-300 h-10 w-10 mb-2 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Click to upload</p>
                </div>
              )}
              <input 
                type="file" accept="image/*" 
                {...register('product_image', { required: 'Product image is required' })} 
                className="absolute inset-0 cursor-pointer opacity-0" 
              />
            </div>
            {errors.product_image && <p className="text-[10px] font-bold text-rose-500 uppercase text-center">{errors.product_image.message}</p>}
          </motion.div>

          {/* Form Actions */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiPlusCircle />
              )}
              {loading ? 'Processing...' : 'Create Product'}
            </button>
            {error && <p className="text-center text-[10px] font-bold uppercase text-rose-500 tracking-tighter">{error}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}