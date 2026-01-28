'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  category_name: string;
};

type FormValues = {
  hidden_categories: string[];
  hidden_products: string[];
};

export default function DealerVisibilityPage() {
  const { id: dealerId } = useParams<{ id: string }>();

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

  /* ---------------- FETCH DEALER ---------------- */
  const fetchDealer = async () => {
    const res = await apiClient.get(`/admin/dealers/${dealerId}`);
    setDealerName(res.data.dealer.name);
  };

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = async () => {
    const res = await apiClient.get('/admin/categories', {
      params: {
        search: categorySearch,
        sortBy: 'name',
        sortOrder,
        limit: 100,
      },
    });
    setCategories(res.data.data);
  };

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    const params: any = {
      search: productSearch,
      sortBy: 'name',
      sortOrder,
      limit: 100,
    };

    if (categoryFilter) {
      params['filter[key]'] = 'category_id';
      params['filter[value]'] = categoryFilter;
    }

    const res = await apiClient.get('/admin/products', { params });

    setProducts(
      res.data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id,
        category_name: p.categories.name,
      }))
    );
  };

  /* ---------------- FETCH VISIBILITY ---------------- */
  const fetchVisibility = async () => {
    const res = await apiClient.get(`/admin/visibility/${dealerId}`);

    reset({
      hidden_categories: res.data.hiddenCategories.map(
        (c: any) => c.categories.id
      ),
      hidden_products: res.data.hiddenProducts.map(
        (p: any) => p.products.id
      ),
    });
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    Promise.all([
      fetchDealer(),
      fetchCategories(),
      fetchProducts(),
      fetchVisibility(),
    ]).finally(() => setLoading(false));
  }, []);

  /* ---------------- SERVER-SIDE REFETCH ---------------- */
  useEffect(() => {
    fetchCategories();
  }, [categorySearch, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [productSearch, categoryFilter, sortOrder]);

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setMessage(null);

    await apiClient.put(`/admin/visibility/${dealerId}`, data);

    setMessage('Visibility updated successfully');
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Manage Visibility – {dealerName}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">

        {/* ================= CATEGORIES ================= */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Hide Categories</h2>

          <input
            placeholder="Search category..."
            className="w-full border rounded px-3 py-2 text-sm mb-3"
            onChange={(e) => setCategorySearch(e.target.value)}
          />

          <div className="space-y-2 max-h-80 overflow-auto">
            {categories.map((c) => (
              <label key={c.id} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={c.id}
                  {...register('hidden_categories')}
                />
                {c.name}
              </label>
            ))}
          </div>
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Hide Products</h2>

          <input
            placeholder="Search product..."
            className="w-full border rounded px-3 py-2 text-sm mb-2"
            onChange={(e) => setProductSearch(e.target.value)}
          />

          <select
            className="w-full border rounded px-3 py-2 text-sm mb-2"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="space-y-2 max-h-80 overflow-auto">
            {products.map((p) => (
              <label key={p.id} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  value={p.id}
                  {...register('hidden_products')}
                />
                {p.name}
                <span className="text-xs text-gray-500">
                  ({p.category_name})
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ================= ACTIONS ================= */}
        <div className="md:col-span-2 flex justify-between items-center">
          

          <button
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <p className="md:col-span-2 text-green-600 text-center">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

