'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { FiSearch, FiSave, FiPercent, FiChevronLeft, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  /* ---------------- STATE ---------------- */
  const [dealerName, setDealerName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 20;

  /* ---------------- FETCH DEALER ---------------- */
  const fetchDealer = async () => {
    const res = await apiClient.get(`/admin/dealers/${dealerId}`);
    setDealerName(res.data.dealer.name);
  };

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    const res = await apiClient.get('/admin/categories', {
      params: { search, sortBy: 'name', sortOrder, page, limit },
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

  /* ---------------- REFETCH ON FILTER CHANGE ---------------- */
  useEffect(() => {
    const refetch = async () => {
      const categoryList = await fetchCategories();
      setCategories(categoryList);
      reset((prev) => ({
        discounts: categoryList.map((cat) => {
          const existing = prev.discounts?.find(d => d.category_id === cat.id);
          return {
            category_id: cat.id,
            discount_percentage: existing?.discount_percentage ?? 0,
          };
        }),
      }));
    };
    if (!loading) refetch();
  }, [search, sortOrder, page]);

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const discountsToSave = data.discounts.filter(d => d.discount_percentage > 0);
      await apiClient.put(`/admin/discounts/${dealerId}`, { discounts: discountsToSave });
      setMessage('Discounts updated successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update discounts');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <FiLoader className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading Configuration...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <FiChevronLeft /> Back to Dealers
          </button>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Manage Discounts</h1>
          <p className="text-sm font-medium text-slate-500">
            Setting custom rates for <span className="text-indigo-600 font-bold">{dealerName}</span>
          </p>
        </div>

        <div className="relative group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            placeholder="Search category..."
            className="w-full md:w-64 rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-48 text-right">Discount Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-slate-400">
                      <FiAlertCircle className="mx-auto h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No categories matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700 uppercase tracking-tight text-sm">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block w-32">
                          <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            {...register(`discounts.${index}.discount_percentage`, {
                              valueAsNumber: true,
                              min: 0,
                              max: 100,
                            })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-right text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                          />
                          <input type="hidden" {...register(`discounts.${index}.category_id`)} value={category.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-6">
            <div className="flex-1">
              {message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
                  <FiCheckCircle /> {message}
                </motion.p>
              )}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-500">
                  <FiAlertCircle /> {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}