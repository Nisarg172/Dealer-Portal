'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import apiClient from '@/lib/axios';
import {
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiArrowUpRight,
  FiTrendingUp,
  FiDollarSign,
  FiBox,
  FiClock,
} from 'react-icons/fi';

type DashboardStats = {
  totalSpend: number;
  activeOrders: number;
  cartValue: number;
  cartItemsCount: number;
};

type RecentOrder = {
  id: string;
  product: string;
  created_at: string;
  status: string;
  amount: number;
};

type DealerDashboardResponse = {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const getStatusStyle = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'approved') return 'bg-emerald-50 text-emerald-600';
  if (normalized === 'pending') return 'bg-amber-50 text-amber-600';
  if (normalized === 'cancelled' || normalized === 'rejected') {
    return 'bg-rose-50 text-rose-600';
  }
  return 'bg-slate-100 text-slate-600';
};

export default function DealerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DealerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get('/dealer/dashboard');
        setDashboardData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Total Spend',
        value: formatCurrency(dashboardData?.stats.totalSpend ?? 0),
        change: 'Live',
        icon: FiDollarSign,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        label: 'Active Orders',
        value: String(dashboardData?.stats.activeOrders ?? 0),
        change: 'Running',
        icon: FiBox,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: 'Cart Value',
        value: formatCurrency(dashboardData?.stats.cartValue ?? 0),
        change: `${dashboardData?.stats.cartItemsCount ?? 0} Items`,
        icon: FiShoppingCart,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
      },
    ],
    [dashboardData]
  );

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP ROW: STATS --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {loading
          ? [...Array(3)].map((_, i) => (
              <motion.div
                variants={itemVariants}
                key={i}
                className="h-28 rounded-3xl border border-slate-100 bg-white animate-pulse"
              />
            ))
          : stats.map((stat, i) => (
              <motion.div
                variants={itemVariants}
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.bg} ${stat.color}`}>
                  {stat.change}
                </span>
              </motion.div>
            ))}
      </motion.div>

      {/* --- MIDDLE ROW: MAIN ACTIONS & RECENT ORDERS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Navigation Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/dealer/categories" className="group">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white h-full relative overflow-hidden transition-transform hover:scale-[1.02]">
                <FiPackage className="absolute -right-4 -bottom-4 text-white/10 size-32" />
                <h3 className="text-2xl font-bold mb-2">Product Catalog</h3>
                <p className="text-indigo-100 mb-6 text-sm">Explore new inventory with dealer discounts.</p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md">
                  Browse Store <FiArrowUpRight />
                </div>
              </div>
            </Link>

            <Link href="/dealer/orders" className="group">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 h-full relative overflow-hidden transition-transform hover:scale-[1.02] shadow-sm">
                <FiFileText className="absolute -right-4 -bottom-4 text-slate-100 size-32" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Tracking</h3>
                <p className="text-slate-500 mb-6 text-sm">Check shipment status and download invoices.</p>
                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold">
                  View History <FiArrowUpRight />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-5">
            <FiClock className="text-indigo-600" /> Recent Orders
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : dashboardData?.recentOrders?.length ? (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-100 p-3 hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">
                        {order.product}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {formatCurrency(order.amount)}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-1 rounded-md ${getStatusStyle(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent orders found.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          {error}
        </div>
      )}
    </div>
  );
}
