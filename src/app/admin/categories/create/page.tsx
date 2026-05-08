'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { ClipboardEvent, useEffect, useState } from 'react';
import { FiChevronLeft, FiFolderPlus, FiPlusCircle, FiLoader, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

type CreateCategoryFormInputs = {
  main_category: string;
  sub_category: string;
  category_image?: FileList;
};

export default function CreateCategoryPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateCategoryFormInputs>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pastedImage, setPastedImage] = useState<File | null>(null);

  const categoryImage = watch('category_image');

  useEffect(() => {
    if (!categoryImage || categoryImage.length === 0) {
      return;
    }

    const objectUrl = URL.createObjectURL(categoryImage[0]);
    setPreview(objectUrl);
    setPastedImage(null);

    return () => URL.revokeObjectURL(objectUrl);
  }, [categoryImage]);

  useEffect(() => {
    if (!pastedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(pastedImage);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [pastedImage]);

  const handleImagePaste = (event: ClipboardEvent<HTMLFormElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith('image/')
    );

    if (!imageItem) {
      return;
    }

    const imageFile = imageItem.getAsFile();
    if (!imageFile) {
      return;
    }

    event.preventDefault();
    const extension = imageFile.type.split('/')[1] || 'png';
    const normalizedImage = new File([imageFile], `pasted-category-image.${extension}`, {
      type: imageFile.type,
    });

    setPastedImage(normalizedImage);
    setError(null);
    setSuccess(null);
  };

  const onSubmit = async (data: CreateCategoryFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('main_category', data.main_category.trim());
      formData.append('sub_category', data.sub_category.trim());

      const selectedImage = pastedImage || data.category_image?.[0];
      if (selectedImage) {
        formData.append('category_image', selectedImage);
      }

      const response = await apiClient.post('/admin/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        setSuccess('Category created successfully!');
        setPreview(null);
        setPastedImage(null);
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
        <p className="text-slate-500 text-sm">Create a main category and sub category mapping.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <form onPaste={handleImagePaste} onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Main Category
            </label>
            <div className="relative group">
              <FiFolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                {...register('main_category', { required: 'Main category is required' })}
                placeholder="e.g. ElkoEP"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            {errors.main_category && (
              <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tighter">
                {errors.main_category.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Sub Category
            </label>
            <div className="relative group">
              <FiFolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                {...register('sub_category', { required: 'Sub category is required' })}
                placeholder="e.g. Timers / Relays"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            {errors.sub_category && (
              <p className="text-[10px] font-bold text-rose-500 ml-1 uppercase tracking-tighter">
                {errors.sub_category.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Category Photo
            </label>
            <div className="relative h-[200px] w-[320px] max-w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center transition-colors hover:bg-slate-100 group">
              {preview ? (
                <Image
                  quality={70}
                  src={preview}
                  alt="Category preview"
                  className="h-full w-full object-contain"
                  width={1000}
                  height={750}
                />
              ) : (
                <div className="text-center">
                  <FiImage className="mx-auto text-slate-300 h-10 w-10 mb-2 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Click to upload</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                {...register('category_image')}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-tighter">
              Optional image (JPG/PNG/WebP) — upload or paste copied image (Ctrl/Cmd + V)
            </p>
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