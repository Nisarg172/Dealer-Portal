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
};

type ProductData = {
  id: string;
  name: string;
  category_id: string; // The ID of the associated category
  base_price: number;
  description: string;
  status: 'active' | 'inactive';
};

type Category = {
  id: string;
  name: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditProductFormInputs>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories first
        const categoriesResponse = await apiClient.get('/admin/categories');
        setCategories(categoriesResponse.data.categories);
        setFetchingCategories(false);

        // Then fetch product details
        const productResponse = await apiClient.get(`/admin/products/${id}`);
        const product: ProductData = productResponse.data.product;
        reset({
          name: product.name,
          category_id: product.category_id,
          base_price: product.base_price,
          description: product.description,
          status: product.status,
        });
      } catch (err: any) {
        console.error('Error fetching data for product form:', err);
        setError(err.response?.data?.error || 'Failed to fetch product details or categories.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset]);

  const onSubmit = async (data: EditProductFormInputs) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put(`/admin/products/${id}`, data); // Assuming PUT endpoint for update
      if (response.data.success) {
        setSuccess('Product updated successfully!');
        router.push('/admin/products'); // Redirect back to product list
      } else {
        setError(response.data.error || 'Failed to update product.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetchingCategories) {
    return <div className="container mx-auto px-4 py-8">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Product: {id}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Product name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category_id"
              {...register('category_id', { required: 'Category is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
          </div>

          <div>
            <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">Base Price</label>
            <input
              type="number"
              id="base_price"
              step="0.01"
              {...register('base_price', { required: 'Base price is required', valueAsNumber: true, min: { value: 0, message: 'Price cannot be negative' } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.base_price && <p className="mt-1 text-sm text-red-600">{errors.base_price.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              {...register('status', { required: 'Status is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
