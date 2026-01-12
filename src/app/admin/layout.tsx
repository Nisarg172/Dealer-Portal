'use client';

import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // As per prompt: "Role validation via backend + middleware"
  // If this component renders, we assume the middleware has already validated admin role.

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, show a message to the user
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="block p-2 rounded hover:bg-gray-700">Dashboard</Link>
          <Link href="/admin/dealers" className="block p-2 rounded hover:bg-gray-700">Dealers</Link>
          <Link href="/admin/categories" className="block p-2 rounded hover:bg-gray-700">Categories</Link>
          <Link href="/admin/products" className="block p-2 rounded hover:bg-gray-700">Products</Link>
          <Link href="/admin/discounts" className="block p-2 rounded hover:bg-gray-700">Discounts</Link>
          <Link href="/admin/visibility" className="block p-2 rounded hover:bg-gray-700">Visibility</Link>
          <Link href="/admin/orders" className="block p-2 rounded hover:bg-gray-700">Orders</Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left p-2 rounded hover:bg-gray-700 focus:outline-none"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
