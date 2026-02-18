"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiEye, FiArrowRight, FiShoppingCart, FiFilter, FiX, FiChevronDown } from "react-icons/fi"; // Added FiChevronDown
import { Category } from "@/app/admin/categories/category.columns";
import { Product } from "@/app/admin/products/product.columns";
import { useRouter } from "next/navigation";

export default function DealerProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Search bar control
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // New state for custom dropdown
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Outside click logic to close search and dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    apiClient.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const res = await apiClient.get("/dealer/products", {
        params: { search, category_id: activeCategory === "" ? null : activeCategory },
      });
      setProducts(res.data.products);
      setLoading(false);
    };
    fetchProducts();
  }, [search, activeCategory]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen relative">
      
      {/* --- DYNAMIC FLOATING SEARCH & FILTER --- */}
      <div ref={searchRef} className="fixed z-[100]">
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.div 
              key="icons"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="fixed left-[8px] top-[80px] flex flex-col gap-2"
            >
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 bg-white shadow-lg border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
              >
                <FiSearch size={18} />
              </button>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 bg-white shadow-lg border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-indigo-50 transition-all active:scale-95"
              >
                <FiFilter size={18} />
              </button>
            </motion.div>
          ) : (
            /* --- EXPANDED BAR STATE --- */
            <motion.div 
              key="bar"
              initial={{ y: -80, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: -80, x: "-50%", opacity: 0 }}
              className="fixed top-[20px] left-1/2 w-[95%] max-w-[850px] bg-white shadow-2xl border border-slate-100 rounded-2xl flex items-center h-[60px] px-4"
            >
              {/* Search Section */}
              <div className="flex flex-grow items-center h-full">
                <FiSearch className="text-slate-400 shrink-0" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-700 px-3"
                />
              </div>

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-slate-200 mx-2 shrink-0" />

              {/* --- CUSTOM DROPDOWN SECTION --- */}
              <div className="relative shrink-0">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 border-2 border-indigo-100 rounded-xl bg-slate-50/50 hover:bg-white transition-all min-w-[150px] justify-between group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 truncate max-w-[100px]">
                    {activeCategory ? categories.find(c => c.id === activeCategory)?.name : "Categories"}
                  </span>
                  <FiChevronDown className={`text-indigo-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                {/* Animated List Container */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full -right-25 mt-2 w-64 bg-white  border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden z-[90] py-2"
                    >
                      <div 
                        onClick={() => { setActiveCategory(""); setDropdownOpen(false); }}
                        className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 cursor-pointer"
                      >
                        All Categories
                      </div>
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {categories.map((cat) => (
                          <div 
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setDropdownOpen(false); }}
                            className={`px-4 py-3 text-sm font-semibold transition-colors cursor-pointer border-b border-slate-50 last:border-none
                              ${activeCategory === cat.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-500'}`}
                          >
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => { setIsSearchOpen(false); setDropdownOpen(false); }}
                className="ml-3 p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all shrink-0"
              >
                <FiX size={22} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- GRID (Rest of code remains exactly same) --- */}
      <div className="mt-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              const hasDiscount = product.discounted_price < product.base_price;
              return (
                <motion.div
                  layout
                  key={product.id}
                  className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-50/50 p-4 overflow-hidden">
                    <Image
                      src={product.image_url || "/images/product_dummy.png"}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">{product.category_name}</p>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-3">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-md font-black">₹{hasDiscount ? product.discounted_price.toLocaleString() : product.base_price.toLocaleString()}</span>
                      <div className="flex gap-2">
                        {/* <button className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center">
                          <FiShoppingCart size={14} />
                        </button> */}
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-transparent group-hover:border-slate-100 cursor-pointer transition-all" onClick={()=>{router.push(`product/${product.id}`)}}>
                          <FiEye size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}