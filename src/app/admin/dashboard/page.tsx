'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  ShieldCheck,
  Zap
} from 'lucide-react';

/* ================= DUMP DATA ================= */
const stats = [
  { label: 'Total Dealers', value: '124', change: '+12%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Total Products', value: '1,420', change: '+5.4%', isPositive: true, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Recent Orders', value: '48', change: '-2%', isPositive: false, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Revenue', value: '$42,500', change: '+18%', isPositive: true, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
];

const lowStockItems = [
  { id: 1, name: 'Premium Brake Pads', sku: 'BK-9021', stock: 4, unit: 'sets' },
  { id: 2, name: 'Synthetic Oil 5W-30', sku: 'OL-4412', stock: 12, unit: 'cans' },
  { id: 3, name: 'LED Headlight Bulb', sku: 'LT-1100', stock: 2, unit: 'pairs' },
];

const systemHealth = [
  { name: 'API Gateway', status: 'Operational', latency: '42ms', color: 'bg-green-500' },
  { name: 'Database Clusters', status: 'Healthy', latency: '12ms', color: 'bg-green-500' },
  { name: 'Storage Service', status: 'Near Capacity', latency: '89ms', color: 'bg-orange-500' },
];

const recentActivities = [
  { id: 1, user: 'Hardik Thummar', action: 'Created new order #ORD-7721', time: '2 mins ago' },
  { id: 2, user: 'Mihir Patel', action: 'Updated company profile', time: '15 mins ago' },
  { id: 3, user: 'Sanjay Shah', action: 'Added 5 new products', time: '1 hour ago' },
  { id: 4, user: 'Vishal Gajera', action: 'Requested deactivation', time: '3 hours ago' },
];

/* ================= COMPONENT ================= */
export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-[#FBFBFD]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Overview</h1>
          <p className="text-sm text-gray-500">Real-time system performance and management portal.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all shadow-sm">
            <Clock size={16} className="text-gray-400" />
            Last 24 Hours
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={22} />
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MANAGEMENT & ANALYTICS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Management */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Zap size={20} className="text-blue-500" />
              Core Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ManagementCard title="Dealers" desc="Active accounts & verification." href="/admin/dealers" icon={<Users className="text-blue-500" />} />
              <ManagementCard title="Products" desc="Inventory & stock control." href="/admin/products" icon={<Package className="text-purple-500" />} />
              <ManagementCard title="Orders" desc="Sales tracking & fulfillment." href="/admin/orders" icon={<ShoppingBag className="text-orange-500" />} />
            </div>
          </section>

          {/* Dummy Analytics Graph */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-gray-800">Growth Performance</h2>
              <div className="flex gap-4 text-xs font-bold text-gray-400 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Sales</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-300"></span> Visits</span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-40">
              {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75, 55, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-500/10 rounded-t-sm relative group cursor-pointer">
                  <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition-all" style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Low Stock Section */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Inventory Alerts
              </h2>
              <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Low Stock</span>
            </div>
            <div className="divide-y divide-gray-50">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{item.stock} {item.unit}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Remaining</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: ACTIVITY & HEALTH */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Live Feed</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-1">
                {recentActivities.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 rounded-xl transition-all cursor-default">
                    <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="text-xs leading-relaxed"><span className="font-bold text-gray-900">{item.user}</span> <span className="text-gray-500">{item.action}</span></p>
                      <span className="text-[10px] text-gray-400 mt-1 block font-medium">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-50 uppercase tracking-widest">
                Full Logs
              </button>
            </div>
          </section>

          {/* System Health Monitor */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Infrastructure</h2>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              {systemHealth.map((sys, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{sys.name}</span>
                    <span className="text-[10px] font-mono text-gray-400">{sys.latency}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${sys.color} rounded-full`} style={{ width: '100%' }}></div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${sys.color} animate-pulse`}></div>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-green-600">
                <ShieldCheck size={14} /> All Systems Operational
              </div>
            </div>
          </section>

          {/* Quick Summary Card */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-200" />
                Revenue Target
              </h3>
              <p className="text-blue-100 text-xs mb-4">You are at 82% of your monthly goal.</p>
              <div className="w-full h-2 bg-blue-400/30 rounded-full mb-2">
                <div className="w-[82%] h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-blue-100 text-right">$7,500 more to go</p>
            </div>
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-500/20 group-hover:scale-110 transition-transform" />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */
function ManagementCard({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
      <div className="mb-4 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
        {title}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
      </h3>
      <p className="text-xs text-gray-400 mt-2 leading-relaxed font-medium">{desc}</p>
    </Link>
  );
}