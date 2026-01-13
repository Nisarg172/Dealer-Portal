'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useForm } from 'react-hook-form';

type CategoryDiscount = {
  category_id: string;
  discount_percentage: number;
};

type Category = {
  id: string;
  name: string;
};

export default function ManageDealerDiscountsPage() {
  const router = useRouter();
  const params = useParams();
  const { id: dealerId } = params as { id: string };
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ discounts: CategoryDiscount[] }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dealerName, setDealerName] = useState<string>('');

  useEffect(() => {
    const fetchDiscountsAndCategories = async () => {
      try {
        // Fetch dealer details
        const dealerResponse = await apiClient.get(`/admin/dealers/${dealerId}`);
        setDealerName(dealerResponse.data.dealer.name);

        // Fetch all categories
        const categoriesResponse = await apiClient.get('/admin/categories',{});
        setCategories(categoriesResponse.data.data);

        // Fetch existing discounts for this dealer
        const discountsResponse = await apiClient.get(`/admin/discounts/${dealerId}`); // Assuming this API exists
        const existingDiscounts: CategoryDiscount[] = discountsResponse.data.discounts; // { category_id, discount_percentage }

        // Pre-populate form with existing discounts
        const initialDiscounts = categoriesResponse.data.data.map((category: Category) => {
          const existing = existingDiscounts.find(d => d.category_id === category.id);
          return {
            category_id: category.id,
            discount_percentage: existing ? existing.discount_percentage : 0,
          };
        });
        reset({ discounts: initialDiscounts });

      } catch (err: any) {
        console.error('Error fetching data for discounts:', err);
        setError(err.response?.data?.error || 'Failed to load discount data.');
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchDiscountsAndCategories();
    }
  }, [dealerId, reset]);

  const onSubmit = async (data: { discounts: CategoryDiscount[] }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Filter out categories with 0% discount if desired, or send all
      const discountsToUpdate = data.discounts.filter(d => d.discount_percentage > 0);
      
      const response = await apiClient.put(`/admin/discounts/${dealerId}`, { discounts: discountsToUpdate }); // Assuming PUT endpoint for update
      if (response.data.success) {
        setSuccess('Discounts updated successfully!');
      } else {
        setError(response.data.error || 'Failed to update discounts.');
      }
    } catch (err: any) {
      console.error('Error updating discounts:', err);
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading discount settings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Discounts for {dealerName}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {categories.length === 0 ? (
            <p className="text-gray-700">No categories available to assign discounts.</p>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Category Discounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <label htmlFor={`discount-${category.id}`} className="block text-sm font-medium text-gray-700 w-1/2">{category.name}</label>
                    <input
                      type="number"
                      id={`discount-${category.id}`}
                      {...register(`discounts.${index}.discount_percentage`, {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Min 0%' },
                        max: { value: 100, message: 'Max 100%' },
                      })}
                      className="mt-1 block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="%"
                    />
                    {errors.discounts?.[index]?.discount_percentage && (
                      <p className="text-sm text-red-600">{errors.discounts[index]?.discount_percentage?.message}</p>
                    )}
                    <input type="hidden" {...register(`discounts.${index}.category_id`)} value={category.id} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center mt-4">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Discounts'}
          </button>
        </form>
      </div>
    </div>
  );
}
