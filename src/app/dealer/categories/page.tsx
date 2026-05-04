"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { FiArrowRight, FiImage } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";

type DealerCategory = {
  id: string;
  name: string;
  image_url?: string | null;
};

export default function DealerCategoriesPage() {
  const [categories, setCategories] = useState<DealerCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const res = await apiClient.get("/categories");
      setCategories(res.data.categories || []);
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a category to view products
        </p>
      </div>

      {loadingCategories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/dealer/products?category_id=${cat.id}`)}
              className="text-left rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="relative h-[170px] w-full bg-slate-50 border-b border-slate-100">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                    <FiImage size={34} />
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-500 mb-2">
                  Category
                </p>
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <div className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500 group-hover:text-indigo-500 transition-colors">
                  View products <FiArrowRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
