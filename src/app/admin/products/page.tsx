'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  categories: { name: string,id:string }; // Assuming category object with a name
  base_price: number;
  description: string;
  // images: string[]; // Placeholder for images
  is_active: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/products');
      setProducts(response.data.products);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.error || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await apiClient.delete(`/admin/products/${productId}`);
      fetchProducts(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.error || 'Failed to delete product.');
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h1>
      <div className="flex justify-end mb-4">
        <Link href="/admin/products/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Product
        </Link>
      </div>
      
      {products.length === 0 ? (
        <p className="text-gray-700">No products found. Create a new product to get started.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base Price</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{product.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{product.categories?.name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">₹{product.base_price.toFixed(2)}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${product.is_active ? 'text-green-900' : 'text-red-900'}`}>
                      <span aria-hidden="true" className={`absolute inset-0 opacity-50 rounded-full ${product.is_active ? 'bg-green-200' : 'bg-red-200'}`}></span>
                      <span className="relative">{product.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">Edit</Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
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