'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { FiArrowLeft } from 'react-icons/fi';

type EditCategoryFormInputs = {
  name: string;
  // Add any other fields for category editing
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
        console.error('Error fetching category:', err);
        setError(err.response?.data?.error || 'Failed to fetch category details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, reset]);

  const onSubmit = async (data: EditCategoryFormInputs) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put(`/admin/categories/${id}`, data); // Assuming PUT endpoint for update
      if (response.data.success) {
        setSuccess('Category updated successfully!');
        router.push('/admin/categories'); // Redirect back to category list
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
    return <div className="container mx-auto px-4 py-8">Loading category details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4">
        <button
              onClick={() => router.back()}
              className="mb-2 inline-flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-blue-600 transition"
            >
              <FiArrowLeft className="text-lg" />
              Back
            </button>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Category</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Category name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Category'}
          </button>
        </form>
      </div>
    </div>
  );
}

