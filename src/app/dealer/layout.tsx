'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
      <aside className="w-64 bg-white shadow-md p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Dealer Portal</h2>
        <nav className="space-y-2">
          <Link href="/dealer/dashboard" className="block p-2 rounded hover:bg-gray-200">Dashboard</Link>
          <Link href="/dealer/products" className="block p-2 rounded hover:bg-gray-200">Products</Link>
          <Link href="/dealer/cart" className="block p-2 rounded hover:bg-gray-200">Cart</Link>
          <Link href="/dealer/orders" className="block p-2 rounded hover:bg-gray-200">Orders</Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left p-2 rounded hover:bg-gray-200 focus:outline-none"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}