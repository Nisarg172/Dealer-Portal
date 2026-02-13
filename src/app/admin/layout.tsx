'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiUsers, FiGrid, FiBox, FiPercent, 
  FiEye, FiClipboard, FiLogOut, FiMenu, FiX, FiChevronLeft, FiSearch, FiBell 
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: FiHome },
  { label: 'Dealers', href: '/admin/dealers', icon: FiUsers },
  { label: 'Categories', href: '/admin/categories', icon: FiGrid },
  { label: 'Products', href: '/admin/products', icon: FiBox },
  { label: 'Discounts', href: '/admin/discounts', icon: FiPercent },
  { label: 'Visibility', href: '/admin/visibility', icon: FiEye },
  { label: 'Orders', href: '/admin/orders', icon: FiClipboard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Search Logic
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Current Page Name Logic
  const currentPage = navItems.find(item => item.href === pathname)?.label || 'Admin';

  useEffect(() => setIsMobileOpen(false), [pathname]);

  const filteredNav = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (href: string) => {
    router.push(href);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 240 }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="hidden lg:flex flex-col bg-slate-900 text-white relative z-50 shadow-2xl overflow-hidden"
      >
        <SidebarContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} pathname={pathname} />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-[280px] bg-slate-900 z-[70] lg:hidden"
            >
              <SidebarContent isCollapsed={false} pathname={pathname} mobileClose={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* --- TOP BAR --- */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          
          <div className="flex items-center flex-1 gap-6">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-600">
              <FiMenu size={24} />
            </button>

            {/* PAGE NAME / TITLE */}
            <div className="hidden xl:flex items-center gap-2">
                <span className="text-slate-300 font-light">/</span>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    {currentPage}
                </h2>
            </div>

            {/* Functional Search Bar */}
            <div className="relative max-w-md w-full hidden md:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FiSearch size={18} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search pages (e.g. Products, Orders...)"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden"
                  >
                    {filteredNav.length > 0 ? (
                      filteredNav.map(item => (
                        <button
                          key={item.href}
                          onClick={() => handleSearchSelect(item.href)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
                        >
                          <item.icon size={16} className="text-indigo-500" />
                          {item.label}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-400 text-sm italic">No pages found</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <FiBell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

            <div className="flex items-center gap-3 pl-2 group cursor-pointer">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">Admin User</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 border-2 border-white group-hover:scale-105 transition-transform">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-full h-full"
          >
            <div className="bg-white rounded-3xl border border-slate-200 p-6 min-h-full shadow-sm">
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ isCollapsed, setIsCollapsed, pathname, mobileClose }: any) {
  return (
    <div className="flex flex-col h-full py-6 overflow-hidden">
      <div className="px-6 h-12 mb-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black text-xl text-white tracking-tight">
            ADMIN <span className="text-indigo-400 text-2xl">PANEL</span>
          </motion.span>
        )}
        {setIsCollapsed ? (
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg bg-slate-800 text-white ml-auto">
            <FiChevronLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <button onClick={mobileClose} className="text-slate-400"><FiX size={24}/></button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`
                relative flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}>
                <div className="shrink-0"><item.icon size={20} /></div>
                {!isCollapsed && (
                  <span className="font-bold text-[13px] tracking-tight whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto pt-4 border-t border-slate-800">
        <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all">
          <FiLogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-bold uppercase tracking-widest">Logout</span>}
        </button>
      </div>
    </div>
  );
}