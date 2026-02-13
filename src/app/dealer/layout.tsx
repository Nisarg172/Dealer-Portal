'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', href: '/dealer/dashboard', icon: FiGrid },
  { label: 'Products', href: '/dealer/products', icon: FiPackage },
  { label: 'Orders', href: '/dealer/orders', icon: FiFileText },
  { label: 'Cart', href: '/dealer/cart', icon: FiShoppingCart },
];

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 font-sans">
      
      {/* --- FIXED FULL-WIDTH NAVBAR --- */}
      <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-sm h-16' 
          : 'bg-white border-transparent h-20'
      }`}>
        <div className="h-full w-full px-4 sm:px-8 flex items-center justify-between relative">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center text-white">
                <FiPackage size={22} />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 hidden sm:block">
                DEALER PORTAL
              </span>
            </div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center h-full absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className="h-full flex items-center">
                    <div className={`
                      relative px-6 h-full flex items-center gap-2 font-bold text-[15px] transition-all duration-200
                      ${isActive 
                        ? 'text-indigo-600' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'}
                    `}>
                      <item.icon size={18} />
                      {item.label}
                      
                      {isActive && (
                        <motion.div 
                          layoutId="nav-underline"
                          // Positioned at the exact bottom of the navbar
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 shadow-[0_-2px_10px_rgba(79,70,229,0.3)]"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>

              <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                  <FiUser size={20} />
                </div>
                
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
                </button>
              </div>
            </div>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-white lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <span className="font-black text-xl tracking-tight">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><FiX size={28}/></button>
            </div>
            <div className="p-6 space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-4 p-5 rounded-2xl text-xl font-bold
                    ${pathname.startsWith(item.href) ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-50'}
                  `}>
                    <item.icon size={24} />
                    {item.label}
                  </div>
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 w-full p-5 rounded-2xl text-xl font-bold text-rose-600 bg-rose-50 mt-10"
              >
                <FiLogOut size={24} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <main className="pt-20 lg:pt-24 pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}