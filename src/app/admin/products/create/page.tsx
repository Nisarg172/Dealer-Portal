'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import apiClient from '@/lib/axios';
import { useState, useEffect } from 'react';

type CreateProductFormInputs = {
  name: string;
  category_id: string; // Changed to category_id to link with backend
  base_price: number;
  description: string;
  // images: FileList; // Assuming file upload for images
  status: 'active' | 'inactive';
};

type Category = {
  id: string;
  name: string;
};

export default function CreateProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProductFormInputs>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/admin/categories');
        setCategories(response.data.categories);
      } catch (err: any) {
        console.error('Error fetching categories for product form:', err);
        setCategoryError(err.response?.data?.error || 'Failed to load categories.');
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (data: CreateProductFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // For image upload, you'd typically use FormData
      // const formData = new FormData();
      // formData.append('name', data.name);
      // formData.append('category_id', data.category_id);
      // ... other fields
      // if (data.images && data.images.length > 0) {
      //   formData.append('image', data.images[0]); // Assuming single image upload
      // }

      const response = await apiClient.post('/admin/products', data);
      if (response.data.success) {
        setSuccess('Product created successfully!');
        reset(); // Clear form after successful submission
        router.push('/admin/products'); // Redirect back to product list
      } else {
        setError(response.data.error || 'Failed to create product.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return <div className="container mx-auto px-4 py-8">Loading categories...</div>;
  }

  if (categoryError) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error loading categories: {categoryError}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Product</h1>
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

          {/* Image upload placeholder */}
          {/* <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">Product Images</label>
            <input
              type="file"
              id="images"
              {...register('images')}
              multiple
              className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
          </div> */}

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
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
