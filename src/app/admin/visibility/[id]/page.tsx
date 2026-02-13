'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import { useForm } from 'react-hook-form';
import { 
  FiEyeOff, FiSearch, FiFilter, FiChevronLeft, 
  FiSave, FiLoader, FiCheckCircle, FiLayers, FiPackage 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
};

type FormValues = {
  hidden_categories: string[];
  hidden_products: string[];
};

export default function DealerVisibilityPage() {
  const { id: dealerId } = useParams<{ id: string }>();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      hidden_categories: [],
      hidden_products: [],
    },
  });

  /* ---------------- STATE ---------------- */
  const [dealerName, setDealerName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDealer = async () => {
    const res = await apiClient.get(`/admin/dealers/${dealerId}`);
    setDealerName(res.data.dealer.name);
  };

  const fetchCategories = async () => {
    const res = await apiClient.get('/admin/categories', {
      params: { search: categorySearch, sortBy: 'name', sortOrder, limit: 100 },
    });
    setCategories(res.data.data);
  };

  const fetchProducts = async () => {
    const params: any = { search: productSearch, sortBy: 'name', sortOrder, limit: 100 };
    if (categoryFilter) {
      params['filter[key]'] = 'category_id';
      params['filter[value]'] = categoryFilter;
    }
    const res = await apiClient.get('/admin/products', { params });
    setProducts(res.data.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      category_id: p.category_id,
      category_name: p.categories.name,
    })));
  };

  const fetchVisibility = async () => {
    const res = await apiClient.get(`/admin/visibility/${dealerId}`);
    reset({
      hidden_categories: res.data.hiddenCategories.map((c: any) => c.categories.id),
      hidden_products: res.data.hiddenProducts.map((p: any) => p.products.id),
    });
  };

  useEffect(() => {
    Promise.all([fetchDealer(), fetchCategories(), fetchProducts(), fetchVisibility()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [categorySearch, sortOrder]);
  useEffect(() => { fetchProducts(); }, [productSearch, categoryFilter, sortOrder]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setMessage(null);
    await apiClient.put(`/admin/visibility/${dealerId}`, data);
    setMessage('Visibility updated successfully');
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return (
    <div className="flex h-96 flex-col items-center justify-center gap-4">
      <FiLoader className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Restrictions...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <FiChevronLeft /> Back to Dealers
          </button>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <FiEyeOff className="text-indigo-600" /> Restriction Management
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Control which items are hidden for <span className="text-indigo-600 font-bold">{dealerName}</span>
          </p>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
          {saving ? 'Saving Changes...' : 'Save Restrictions'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ================= CATEGORIES SECTION ================= */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <FiLayers className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Hide Categories</h2>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                placeholder="Filter categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    value={c.id}
                    {...register('hidden_categories')}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                  />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                    {c.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ================= PRODUCTS SECTION ================= */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <FiPackage className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Hide Specific Products</h2>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Product name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="relative group">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none appearance-none focus:bg-white focus:border-indigo-500 transition-all"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    value={p.id}
                    {...register('hidden_products')}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {p.category_name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </motion.section>
      </form>

      {/* Success Message toast-like notification */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 shadow-emerald-600/20"
        >
          <FiCheckCircle size={20} />
          <span className="text-xs font-black uppercase tracking-widest">{message}</span>
        </motion.div>
      )}
    </div>
  );
}