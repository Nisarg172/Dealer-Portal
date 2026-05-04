'use client';

import { ClipboardEvent, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { FiChevronLeft, FiFolder, FiSave, FiLoader, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';

type EditCategoryFormInputs = {
  name: string;
  category_image?: FileList;
};

type CategoryData = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<EditCategoryFormInputs>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pastedImage, setPastedImage] = useState<File | null>(null);

  const categoryImage = watch('category_image');

  useEffect(() => {
    if (!categoryImage || categoryImage.length === 0) {
      return;
    }

    const objectUrl = URL.createObjectURL(categoryImage[0]);
    setImagePreview(objectUrl);
    setPastedImage(null);

    return () => URL.revokeObjectURL(objectUrl);
  }, [categoryImage]);

  useEffect(() => {
    if (!pastedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(pastedImage);
    setImagePreview(objectUrl);

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

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await apiClient.get(`/admin/categories/${id}`);
        const category: CategoryData = response.data.category;
        reset({
          name: category.name,
        });
        setImagePreview(category.image_url || null);
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
      const formData = new FormData();
      formData.append('name', data.name);
      const selectedImage = pastedImage || data.category_image?.[0];
      if (selectedImage) {
        formData.append('category_image', selectedImage);
      }

      const response = await apiClient.put(`/admin/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
        <form onPaste={handleImagePaste} onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
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
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Category Photo
            </label>
            <div className="relative h-[200px] w-[320px] max-w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center transition-colors hover:bg-slate-100 group">
              {imagePreview ? (
                <Image
                  quality={70}
                  src={imagePreview}
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
            <p className="ml-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
              Upload or paste (Ctrl/Cmd + V) to replace existing image
            </p>
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