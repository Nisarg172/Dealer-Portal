'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useForm } from 'react-hook-form';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
};

type DealerVisibilitySettings = {
  hidden_categories: string[]; // Array of category IDs to hide
  hidden_products: string[]; // Array of product IDs to hide
};

export default function ManageDealerVisibilityPage() {
  const router = useRouter();
  const params = useParams();
  const { id: dealerId } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DealerVisibilitySettings>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dealerName, setDealerName] = useState<string>('');

  useEffect(() => {
    const fetchVisibilityData = async () => {
      try {
        // Fetch dealer details
        const dealerResponse = await apiClient.get(`/admin/dealers/${dealerId}`);
        setDealerName(dealerResponse.data.dealer.name);

        // Fetch all categories
        const categoriesResponse = await apiClient.get('/admin/categories');
        setCategories(categoriesResponse.data.categories);

        // Fetch all products
        const productsResponse = await apiClient.get('/admin/products');
        setProducts(productsResponse.data.products);

        // Fetch existing visibility settings for this dealer
        const visibilityResponse = await apiClient.get(`/admin/visibility/${dealerId}`); // Assuming this API exists
        const existingSettings: DealerVisibilitySettings = visibilityResponse.data.settings;
        
        reset({
          hidden_categories: existingSettings.hidden_categories || [],
          hidden_products: existingSettings.hidden_products || [],
        });

      } catch (err: any) {
        console.error('Error fetching visibility data:', err);
        setError(err.response?.data?.error || 'Failed to load visibility data.');
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchVisibilityData();
    }
  }, [dealerId, reset]);

  const onSubmit = async (data: DealerVisibilitySettings) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await apiClient.put(`/admin/visibility/${dealerId}`, data); // Assuming PUT endpoint for update
      if (response.data.success) {
        setSuccess('Visibility settings updated successfully!');
      } else {
        setError(response.data.error || 'Failed to update visibility settings.');
      }
    } catch (err: any) {
      console.error('Error updating visibility settings:', err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading visibility settings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Visibility for {dealerName}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Category Visibility */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Hide Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-700">No categories available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`hide-category-${category.id}`}
                      value={category.id}
                      {...register('hidden_categories')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`hide-category-${category.id}`} className="ml-2 text-sm text-gray-700">{category.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Visibility */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Hide Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-700">No products available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`hide-product-${product.id}`}
                      value={product.id}
                      {...register('hidden_products')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`hide-product-${product.id}`} className="ml-2 text-sm text-gray-700">{product.name} ({categories.find(c => c.id === product.category_id)?.name})</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center mt-4">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Visibility Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
