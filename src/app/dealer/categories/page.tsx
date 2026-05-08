"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/axios";
import { FiArrowLeft, FiArrowRight, FiImage } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";

type DealerCategory = {
  id: string;
  name: string;
  main_category: string;
  image_url?: string | null;
};

type MainCategoryCard = {
  mainCategory: string;
  image_url: string | null;
  subCount: number;
};

export default function DealerCategoriesPage() {
  const [categories, setCategories] = useState<DealerCategory[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
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

  const mainCategoryCards = useMemo<MainCategoryCard[]>(() => {
    const grouped = categories.reduce((acc, category) => {
      const mainCategory = category.main_category || category.name;
      const existing = acc.get(mainCategory);

      if (!existing) {
        acc.set(mainCategory, {
          mainCategory,
          image_url: category.image_url || null,
          subCount: 1,
        });
        return acc;
      }

      existing.subCount += 1;
      if (!existing.image_url && category.image_url) {
        existing.image_url = category.image_url;
      }
      return acc;
    }, new Map<string, MainCategoryCard>());

    return Array.from(grouped.values()).sort((a, b) =>
      a.mainCategory.localeCompare(b.mainCategory)
    );
  }, [categories]);

  const visibleSubCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          selectedMainCategory &&
          (category.main_category || category.name) === selectedMainCategory
      ),
    [categories, selectedMainCategory]
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">
          {selectedMainCategory || "Categories"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {selectedMainCategory
            ? "Select sub-category to view products"
            : "Select main category to continue"}
        </p>
      </div>

      {selectedMainCategory && (
        <div className="mb-6">
          <button
            onClick={() => setSelectedMainCategory(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors text-sm font-semibold"
          >
            <FiArrowLeft size={16} />
            Back to Main Categories
          </button>
        </div>
      )}

      {loadingCategories ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : !selectedMainCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mainCategoryCards.map((mainCategoryCard) => (
            <button
              key={mainCategoryCard.mainCategory}
              onClick={() => setSelectedMainCategory(mainCategoryCard.mainCategory)}
              className="text-left rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group overflow-hidden"
            >
              <div className="relative h-[170px] w-full bg-slate-50 border-b border-slate-100">
                {mainCategoryCard.image_url ? (
                  <Image
                    src={mainCategoryCard.image_url}
                    alt={mainCategoryCard.mainCategory}
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
               
                <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {mainCategoryCard.mainCategory}
                </h3>
                <div className="mt-5 inline-flex items-center gap-2 text-sm text-slate-500 group-hover:text-indigo-500 transition-colors">
                  View sub-categories <FiArrowRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : visibleSubCategories.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No sub-categories available for selected main category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleSubCategories.map((cat) => (
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
