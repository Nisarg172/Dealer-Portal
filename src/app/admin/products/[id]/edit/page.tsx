'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { 
  FiChevronLeft, FiBox, FiTag, FiDollarSign, 
  FiInfo, FiImage, FiFileText, FiGlobe, 
  FiActivity, FiSave, FiLoader 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

type EditProductFormInputs = {
  name: string;
  category_id: string;
  base_price: number;
  description: string;
  status: 'active' | 'inactive';
  product_image?: FileList;
  datasheet_url?: string;
  product_url?: string;
};

type ProductData = {
  id: string;
  name: string;
  category_id: string;
  base_price: number;
  description: string;
  is_active: boolean;
  datasheet_url?: string;
  product_url?: string;
  image_urls?: string[];
};

type Category = {
  id: string;
  name: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditProductFormInputs>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Watch for image changes for preview
  const product_image = watch('product_image');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (product_image && product_image.length > 0) {
      const file = product_image[0];
      setPreview(URL.createObjectURL(file));
    }
  }, [product_image]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, productRes] = await Promise.all([
          apiClient.get('/admin/categories'),
          apiClient.get(`/admin/products/${id}`),
        ]);

        setCategories(catRes.data.data);
        const product: ProductData = productRes.data.product;

        reset({
          name: product.name,
          category_id: product.category_id,
          base_price: product.base_price,
          description: product.description,
          status: product.is_active ? 'active' : 'inactive',
          datasheet_url: product.datasheet_url || '',
          product_url: product.product_url || '',
        });

        setCurrentImage(product.image_urls?.[0] || null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, reset]);

  const onSubmit = async (data: EditProductFormInputs) => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category_id', data.category_id);
      formData.append('base_price', data.base_price.toString());
      formData.append('description', data.description);
      formData.append('status', data.status);
      if (data.datasheet_url) formData.append('datasheet_url', data.datasheet_url);
      if (data.product_url) formData.append('product_url', data.product_url);
      if (data.product_image && data.product_image.length > 0) {
        Array.from(data.product_image).forEach((file) => formData.append('product_image', file));
      }

      await apiClient.put(`/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
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
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <FiChevronLeft /> Back to Products
        </button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Edit Product</h1>
        <p className="text-sm text-slate-500">Update pricing, availability, and marketing details.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          >
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Product Name</label>
              <div className="relative group">
                <FiBox className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
                <input
                  {...register('name', { required: true })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <div className="relative group">
                <FiInfo className="absolute left-3 top-4 text-slate-400 group-focus-within:text-indigo-500" />
                <textarea
                  rows={4}
                  {...register('description')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    {...register('category_id', { required: true })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Base Price (INR)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number" step="0.01"
                    {...register('base_price', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
          >
             <h2 className="text-sm font-bold text-slate-800">External Resources</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Datasheet Link</label>
                  <div className="relative group">
                    <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('datasheet_url')} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Product Web URL</label>
                  <div className="relative group">
                    <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('product_url')} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs" />
                  </div>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Right Column - Media & Status */}
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-400">Availability</label>
            <div className="relative">
              <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                {...register('status')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="active" className="text-emerald-600">Active</option>
                <option value="inactive" className="text-slate-400">Inactive</option>
              </select>
            </div>
          </motion.div>

          {/* Media Card */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Product Media</label>
            
            <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
              {(preview || currentImage) ? (
                <img src={preview || currentImage!} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <FiImage className="text-slate-300 h-10 w-10" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-bold">Change Image</p>
              </div>
              <input 
                type="file" accept="image/*" {...register('product_image')} 
                className="absolute inset-0 cursor-pointer opacity-0" 
              />
            </div>
            <p className="text-[10px] text-center text-slate-400">Recommended: 800x800px (PNG/JPG)</p>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <FiLoader className="animate-spin" /> : <FiSave />}
              Save Changes
            </button>
            
            {error && (
              <p className="text-center text-[10px] font-bold uppercase tracking-tighter text-rose-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}