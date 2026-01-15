'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { useState, useEffect } from 'react';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormInputs>();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Fetch Categories ---------------- */
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

  /* ---------------- Submit ---------------- */
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
      } else {
        setError(res.data.error || 'Failed to create product');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories)
    return <div className="p-8">Loading categories...</div>;

  /* ---------------- UI ---------------- */
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              {...register('name', { required: 'Product name is required' })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              {...register('category_id', { required: 'Category is required' })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-600">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium">Base Price</label>
            <input
              type="number"
              step="0.01"
              {...register('base_price', {
                required: 'Base price is required',
                valueAsNumber: true,
                min: 0,
              })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={4}
              {...register('description', {
                required: 'Description is required',
              })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Product Image */}
          <div>
            <label className="block text-sm font-medium">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('product_image', {
                required: 'Product image is required',
              })}
              className="mt-1 w-full"
            />
            {errors.product_image && (
              <p className="text-sm text-red-600">
                {errors.product_image.message}
              </p>
            )}
          </div>

          {/* Datasheet URL */}
          <div>
            <label className="block text-sm font-medium">
              Datasheet URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/datasheet.pdf"
              {...register('datasheet_url')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Product Website URL */}
          <div>
            <label className="block text-sm font-medium">
              Product Website URL
            </label>
            <input
              type="url"
              placeholder="https://product-website.com"
              {...register('product_url')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              {...register('status', { required: true })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
