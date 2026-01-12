'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
  // Add any other category fields here
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/categories');
      setCategories(response.data.categories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.error || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await apiClient.delete(`/admin/categories/${categoryId}`);
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Category Management</h1>
      <div className="flex justify-end mb-4">
        <Link href="/admin/categories/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Category
        </Link>
      </div>
      
      {categories.length === 0 ? (
        <p className="text-gray-700">No categories found. Create a new category to get started.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{category.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/categories/${category.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Edit</Link>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}