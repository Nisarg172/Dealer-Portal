'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useForm } from 'react-hook-form';

type Category = {
  id: string;
  name: string;
};

type CategoryDiscount = {
  category_id: string;
  discount_percentage: number;
};

type FormValues = {
  discounts: CategoryDiscount[];
};

export default function ManageDealerDiscountsPage() {
  const { id: dealerId } = useParams<{ id: string }>();

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormValues>();

  /* ---------------- STATE ---------------- */
  const [dealerName, setDealerName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Server-side controls
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 20;

  /* ---------------- FETCH DEALER ---------------- */
  const fetchDealer = async () => {
    const res = await apiClient.get(`/admin/dealers/${dealerId}`);
    setDealerName(res.data.dealer.name);
  };

  /* ---------------- FETCH CATEGORIES (SERVER) ---------------- */
  const fetchCategories = async () => {
    const res = await apiClient.get('/admin/categories', {
      params: {
        search,
        sortBy: 'name',
        sortOrder,
        page,
        limit,
      },
    });

    return res.data.data as Category[];
  };

  /* ---------------- FETCH DISCOUNTS ---------------- */
  const fetchDiscounts = async () => {
    const res = await apiClient.get(`/admin/discounts/${dealerId}`);
    return res.data.discounts as CategoryDiscount[];
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [_, categoryList, discounts] = await Promise.all([
          fetchDealer(),
          fetchCategories(),
          fetchDiscounts(),
        ]);

        setCategories(categoryList);

        // Merge categories + discounts
        reset({
          discounts: categoryList.map((cat) => {
            const found = discounts.find(d => d.category_id === cat.id);
            return {
              category_id: cat.id,
              discount_percentage: found?.discount_percentage ?? 0,
            };
          }),
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ---------------- REFETCH ON SERVER FILTER CHANGE ---------------- */
  useEffect(() => {
    const refetch = async () => {
      const categoryList = await fetchCategories();
      setCategories(categoryList);

      reset((prev) => ({
        discounts: categoryList.map((cat) => {
          const existing = prev.discounts?.find(
            d => d.category_id === cat.id
          );
          return {
            category_id: cat.id,
            discount_percentage: existing?.discount_percentage ?? 0,
          };
        }),
      }));
    };

    refetch();
  }, [search, sortOrder, page]);

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const discountsToSave = data.discounts.filter(
        d => d.discount_percentage > 0
      );

      await apiClient.put(`/admin/discounts/${dealerId}`, {
        discounts: discountsToSave,
      });

      setMessage('Discounts updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update discounts');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Manage Discounts – {dealerName}
      </h1>

      {/* ================= CONTROLS ================= */}
      <div className="flex gap-4">
        <input
          placeholder="Search category..."
          className="border rounded px-3 py-2 text-sm w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow space-y-4">

        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center gap-4 border-b pb-2"
            >
              <div className="w-1/2 font-medium">
                {category.name}
              </div>

              <input
                type="number"
                min={0}
                max={100}
                placeholder="%"
                {...register(`discounts.${index}.discount_percentage`, {
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
                className="w-32 border rounded px-3 py-2 text-sm"
              />

              <input
                type="hidden"
                {...register(`discounts.${index}.category_id`)}
                value={category.id}
              />

              {errors.discounts?.[index]?.discount_percentage && (
                <span className="text-red-600 text-sm">
                  Invalid %
                </span>
              )}
            </div>
          ))
        )}

        {/* ================= ACTION ================= */}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Discounts'}
        </button>

        {message && (
          <p className="text-green-600 text-center">{message}</p>
        )}
      </form>
    </div>
  );
}
