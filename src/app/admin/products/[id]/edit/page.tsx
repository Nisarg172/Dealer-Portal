'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';

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
    formState: { errors },
  } = useForm<EditProductFormInputs>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  /* ---------------- Fetch Product & Categories ---------------- */
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

  /* ---------------- Submit ---------------- */
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

    if (data.datasheet_url) {
      formData.append('datasheet_url', data.datasheet_url);
    }

    if (data.product_url) {
      formData.append('product_url', data.product_url);
    }

    if (data.product_image && data.product_image.length > 0) {
      Array.from(data.product_image).forEach((file) => {
        formData.append('product_image', file);
      });
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



  if (loading)
    return <div className="p-8">Loading product...</div>;

  if (error)
    return <div className="p-8 text-red-600">{error}</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              {...register('name', { required: true })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              {...register('category_id', { required: true })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium">Base Price</label>
            <input
              type="number"
              step="0.01"
              {...register('base_price', { valueAsNumber: true })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={4}
              {...register('description')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Current Image */}
          {currentImage && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Image
              </label>
              <img
                src={currentImage}
                alt="Product"
                className="h-32 rounded border"
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium">
              Replace Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('product_image')}
            />
          </div>

          {/* Datasheet URL */}
          <div>
            <label className="block text-sm font-medium">
              Datasheet URL
            </label>
            <input
              type="url"
              {...register('datasheet_url')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Product URL */}
          <div>
            <label className="block text-sm font-medium">
              Product Website URL
            </label>
            <input
              type="url"
              {...register('product_url')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              {...register('status')}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
