'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiFolder,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';

type Category = {
  id: string;
  name: string;
  main_category: string;
};

type CategoryGroup = {
  mainCategory: string;
  subCategories: Category[];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedMainCategories, setExpandedMainCategories] = useState<Record<string, boolean>>({});
  const [selectedMainCategoryBySubId, setSelectedMainCategoryBySubId] = useState<Record<string, string>>({});
  const [movingCategoryId, setMovingCategoryId] = useState<string | null>(null);
  const [renamingMainCategory, setRenamingMainCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const res = await apiClient.get('/admin/categories', {
        params: {
          page: 1,
          limit: 500,
          sortBy: 'main_category',
          sortOrder: 'asc',
        },
      });

      const fetchedCategories: Category[] = res.data?.data || [];
      setCategories(fetchedCategories);
      setSelectedMainCategoryBySubId(() => {
        const next: Record<string, string> = {};
        for (const category of fetchedCategories) {
          next[category.id] = category.main_category || category.name;
        }
        return next;
      });
      setExpandedMainCategories((prev) => {
        const next = { ...prev };
        for (const category of fetchedCategories) {
          const mainCategory = category.main_category || category.name;
          if (next[mainCategory] === undefined) {
            next[mainCategory] = false;
          }
        }
        return next;
      });
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const groupedCategories = useMemo<CategoryGroup[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = normalizedSearch
      ? categories.filter((category) => {
          const mainCategory = (category.main_category || '').toLowerCase();
          const subCategory = (category.name || '').toLowerCase();
          return (
            mainCategory.includes(normalizedSearch) ||
            subCategory.includes(normalizedSearch)
          );
        })
      : categories;

    const groupedMap = new Map<string, Category[]>();
    filtered.forEach((category) => {
      const mainCategory = category.main_category || category.name;
      if (!groupedMap.has(mainCategory)) {
        groupedMap.set(mainCategory, []);
      }
      groupedMap.get(mainCategory)?.push(category);
    });

    return Array.from(groupedMap.entries())
      .map(([mainCategory, subCategories]) => ({
        mainCategory,
        subCategories: subCategories.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.mainCategory.localeCompare(b.mainCategory));
  }, [categories, search]);

  const availableMainCategories = useMemo(() => {
    return Array.from(
      new Set(categories.map((category) => category.main_category || category.name))
    ).sort((a, b) => a.localeCompare(b));
  }, [categories]);

  const toggleMainCategory = (mainCategory: string) => {
    setExpandedMainCategories((prev) => ({
      ...prev,
      [mainCategory]: !prev[mainCategory],
    }));
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    await apiClient.delete(`/admin/categories/${id}`);
    await fetchCategories(false);
  };

  const renameMainCategory = async (currentMainCategory: string) => {
    const proposedName = prompt('Enter new main category name', currentMainCategory);
    if (!proposedName) return;

    const trimmedName = proposedName.trim();
    if (!trimmedName || trimmedName === currentMainCategory) return;

    setRenamingMainCategory(currentMainCategory);
    try {
      await apiClient.put('/admin/categories/main-category', {
        current_main_category: currentMainCategory,
        new_main_category: trimmedName,
      });
      await fetchCategories(false);
    } catch (error) {
      console.error(error);
      alert('Failed to rename main category. Please try again.');
    } finally {
      setRenamingMainCategory(null);
    }
  };

  const moveSubCategory = async (category: Category) => {
    const currentMainCategory = category.main_category || category.name;
    const selectedMainCategory =
      selectedMainCategoryBySubId[category.id] || currentMainCategory;

    if (selectedMainCategory === currentMainCategory) return;

    setMovingCategoryId(category.id);
    try {
      await apiClient.put(`/admin/categories/${category.id}`, {
        main_category: selectedMainCategory,
        sub_category: category.name,
      });
      await fetchCategories(false);
    } catch (error) {
      console.error(error);
      alert('Failed to move sub category. Please try again.');
    } finally {
      setMovingCategoryId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Category Management
        </h1>

        <Link
          href="/admin/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Category
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative group w-full sm:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search main or sub category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <button
          onClick={() => fetchCategories(false)}
          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
          title="Refresh Data"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Main Category
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Sub Categories
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={3} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : groupedCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-sm font-semibold text-slate-400">
                    No categories found
                  </td>
                </tr>
              ) : (
                groupedCategories.map((group) => {
                  const isExpanded = Boolean(expandedMainCategories[group.mainCategory]);

                  return (
                    <Fragment key={group.mainCategory}>
                      <tr className="bg-slate-50/60">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleMainCategory(group.mainCategory)}
                            className="flex items-center gap-3 text-slate-800 font-semibold hover:text-indigo-600 transition-colors"
                          >
                            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <FiFolder size={16} />
                            </div>
                            <span className="capitalize">{group.mainCategory}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {group.subCategories.length}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => renameMainCategory(group.mainCategory)}
                              disabled={renamingMainCategory === group.mainCategory}
                              className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 hover:bg-amber-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {renamingMainCategory === group.mainCategory ? 'Renaming...' : 'Rename Main'}
                            </button>
                            <button
                              onClick={() => toggleMainCategory(group.mainCategory)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={3} className="px-6 py-0">
                            <div className="py-3 space-y-1">
                              {group.subCategories.map((category, index) => (
                                <div
                                  key={category.id}
                                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 min-w-[24px]">
                                      {index + 1}.
                                    </span>
                                    <span className="text-sm font-semibold text-slate-700 capitalize">
                                      {category.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <select
                                      value={
                                        selectedMainCategoryBySubId[category.id] ||
                                        category.main_category ||
                                        category.name
                                      }
                                      onChange={(e) =>
                                        setSelectedMainCategoryBySubId((prev) => ({
                                          ...prev,
                                          [category.id]: e.target.value,
                                        }))
                                      }
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
                                    >
                                      {availableMainCategories.map((mainCategoryOption) => (
                                        <option key={mainCategoryOption} value={mainCategoryOption}>
                                          {mainCategoryOption}
                                        </option>
                                      ))}
                                    </select>

                                    <button
                                      onClick={() => moveSubCategory(category)}
                                      disabled={
                                        movingCategoryId === category.id ||
                                        (selectedMainCategoryBySubId[category.id] ||
                                          category.main_category ||
                                          category.name) ===
                                          (category.main_category || category.name)
                                      }
                                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-indigo-100 transition-colors"
                                      title="Move to selected main category"
                                    >
                                      {movingCategoryId === category.id ? 'Moving...' : 'Move'}
                                    </button>

                                    <Link
                                      href={`/admin/categories/${category.id}/edit`}
                                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                      title="Edit"
                                    >
                                      <FiEdit2 size={18} />
                                    </Link>

                                    <button
                                      onClick={() => deleteCategory(category.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                                      title="Delete"
                                    >
                                      <FiTrash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
