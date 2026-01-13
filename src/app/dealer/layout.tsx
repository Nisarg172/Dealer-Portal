'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import {
  FiHome,
  FiBox,
  FiShoppingCart,
  FiClipboard,
  FiLogOut,
  FiMenu,
} from 'react-icons/fi';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dealer/dashboard',
    icon: FiHome,
  },
  {
    label: 'Products',
    href: '/dealer/products',
    icon: FiBox,
  },
  {
    label: 'Cart',
    href: '/dealer/cart',
    icon: FiShoppingCart,
  },
  {
    label: 'Orders',
    href: '/dealer/orders',
    icon: FiClipboard,
  },
];

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-18' : 'w-64'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <h2 className="text-lg font-bold tracking-wide">
              Dealer Portal
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-gray-700 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all
                  ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon size={22} />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-all"
          >
            <FiLogOut size={22} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-3rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
