'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiFileText, 
  FiArrowUpRight, 
  FiTrendingUp, 
  FiDollarSign,
  FiBox,
  FiClock
} from 'react-icons/fi';

// --- DUMMY DATA ---
const stats = [
  { label: 'Total Spend', value: '₹4,25,680', change: '+12.5%', icon: FiDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Orders', value: '12', change: 'Running', icon: FiBox, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Cart Value', value: '₹32,400', change: '3 Items', icon: FiShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const recentOrders = [
  { id: '#ORD-7721', product: 'CU3-08M Central Unit', date: '2 hours ago', status: 'Processing', amount: '₹25,423' },
  { id: '#ORD-7718', product: 'DA3-22M Dimmer', date: 'Yesterday', status: 'Shipped', amount: '₹26,710' },
  { id: '#ORD-7715', product: 'Glass Touch Panel', date: '3 Feb 2026', status: 'Delivered', amount: '₹12,946' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function DealerDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      
      {/* --- TOP ROW: STATS --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, i) => (
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
            <Link href="/dealer/products" className="group">
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

        {/* Right Column: Recent Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FiClock className="text-indigo-600" /> Recent Activity
          </h2>
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
            <div className="space-y-6">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-start justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{order.product}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span>{order.id}</span>
                      <span>•</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{order.amount}</p>
                    <span className={`text-[10px] font-bold uppercase ${
                      order.status === 'Shipped' ? 'text-blue-500' : 
                      order.status === 'Processing' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dealer/orders" className="block w-full text-center mt-6 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              View All Orders
            </Link>
          </div>
        </div>

      </div>

      {/* --- FULL WIDTH PROMO SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Limited Time</span>
          <h2 className="text-3xl font-black">Stock Up Sale: 15% Extra Margin</h2>
          <p className="text-indigo-100 max-w-md">Get additional discounts on all Smart Lighting products until Feb 15th. Discount applied at checkout.</p>
        </div>
        <button className="relative z-10 mt-6 md:mt-0 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20">
          Shop Offers Now
        </button>
        {/* Abstract circles for UI flair */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
      </motion.div>
    </div>
  );
}