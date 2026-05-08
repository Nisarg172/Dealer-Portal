"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import apiClient from "@/lib/axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiSearch, FiEye, FiArrowLeft, FiMinus, FiPlus } from "react-icons/fi";
import { Category } from "@/app/admin/categories/category.columns";
import { Product } from "@/app/admin/products/product.columns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 20;
type DealerCartItem = {
  product_id: string;
  quantity: number;
};

function DealerProductListingContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [updatingCartIds, setUpdatingCartIds] = useState<string[]>([]);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category_id") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await apiClient.get("/categories");
      setCategories(res.data.categories || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCartQuantities = async () => {
      try {
        const res = await apiClient.get("/dealer/cart");
        const cartItems: DealerCartItem[] = res.data.cartItems || [];
        const quantityMap = cartItems.reduce<Record<string, number>>((acc, item) => {
          acc[item.product_id] = item.quantity;
          return acc;
        }, {});
        setCartQuantities(quantityMap);
      } catch {
        setCartQuantities({});
      }
    };

    fetchCartQuantities();
  }, []);

  useEffect(() => {
    if (!activeCategory) {
      setProducts([]);
      setPage(1);
      setHasMore(false);
      return;
    }
    setPage(1);
  }, [activeCategory, search]);

  useEffect(() => {
    if (!activeCategory) return;

    const fetchProducts = async () => {
      if (page === 1) {
        setLoadingProducts(true);
      } else {
        setLoadingMoreProducts(true);
      }

      const res = await apiClient.get("/dealer/products", {
        params: { search, category_id: activeCategory, page, limit: PAGE_SIZE },
      });

      const fetchedProducts = res.data.products || [];
      setProducts((prev) => (page === 1 ? fetchedProducts : [...prev, ...fetchedProducts]));
      setHasMore(Boolean(res.data.hasMore));
      setLoadingProducts(false);
      setLoadingMoreProducts(false);
    };

    fetchProducts();
  }, [search, activeCategory, page]);

  useEffect(() => {
    if (!activeCategory) return;
    const node = loadMoreTriggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry.isIntersecting) return;
        if (loadingProducts || loadingMoreProducts || !hasMore) return;
        setPage((prev) => prev + 1);
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [activeCategory, hasMore, loadingMoreProducts, loadingProducts]);

  const setCartItemUpdating = (productId: string, isUpdating: boolean) => {
    setUpdatingCartIds((prev) => {
      if (isUpdating) {
        return prev.includes(productId) ? prev : [...prev, productId];
      }
      return prev.filter((id) => id !== productId);
    });
  };

  const handleAddToOrder = async (productId: string) => {
    const nextQuantity = (cartQuantities[productId] || 0) + 1;
    try {
      setCartItemUpdating(productId, true);
      await apiClient.post("/dealer/cart", {
        productId,
        quantity: nextQuantity,
      });
      setCartQuantities((prev) => ({
        ...prev,
        [productId]: nextQuantity,
      }));
    } catch {
      // Keep listing usable if add-to-cart fails.
    } finally {
      setCartItemUpdating(productId, false);
    }
  };

  const handleUpdateCartQuantity = async (productId: string, nextQuantity: number) => {
    try {
      setCartItemUpdating(productId, true);

      if (nextQuantity < 1) {
        await apiClient.put("/dealer/cart", {
          updates: [{ productId, remove: true }],
        });
        setCartQuantities((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        return;
      }

      await apiClient.put("/dealer/cart", {
        updates: [{ productId, quantity: nextQuantity }],
      });
      setCartQuantities((prev) => ({
        ...prev,
        [productId]: nextQuantity,
      }));
    } catch {
      // Keep listing usable if cart update fails.
    } finally {
      setCartItemUpdating(productId, false);
    }
  };

  const activeCategoryName = useMemo(
    () => categories.find((cat) => cat.id === activeCategory)?.name ?? "Products",
    [activeCategory, categories]
  );

  if (!activeCategory) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen">
        <div className="max-w-xl mx-auto mt-16 bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-slate-800">Select Category First</h2>
          <p className="text-slate-500 mt-2">
            Products are shown based on selected category.
          </p>
          <Link
            href="/dealer/categories"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen relative">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{activeCategoryName}</h1>
          <p className="text-sm text-slate-500 mt-1">Products in selected category</p>
        </div>
        <Link
          href="/dealer/categories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <FiArrowLeft size={16} />
          Back to Categories
        </Link>
      </div>

      <div className="mb-6">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <FiSearch className="text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products in this category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-medium text-slate-700"
          />
        </div>
      </div>

      {loadingProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-white rounded-xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No products found for this category.
        </div>
      ) : (
        <>
          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              const hasDiscount = product.discounted_price < product.base_price;
              const cartQuantity = cartQuantities[product.id] || 0;
              const isCartUpdating = updatingCartIds.includes(product.id);
              return (
                <motion.div
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
                    <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">
                      {product.category_name}
                    </p>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-3">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-md font-black">
                        ₹
                        {hasDiscount
                          ? product.discounted_price.toLocaleString()
                          : product.base_price.toLocaleString()}
                      </span>
                      <button
                        className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-transparent group-hover:border-slate-100 cursor-pointer transition-all"
                        onClick={() => {
                          router.push(`/dealer/product/${product.id}`);
                        }}
                      >
                        <FiEye size={14} />
                      </button>
                    </div>
                    <div className="mt-3">
                      {cartQuantity > 0 ? (
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden w-fit">
                          <button
                            onClick={() =>
                              handleUpdateCartQuantity(product.id, cartQuantity - 1)
                            }
                            disabled={isCartUpdating}
                            className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-50 transition-colors"
                          >
                            <FiMinus size={13} />
                          </button>
                          <div className="w-10 h-8 flex items-center justify-center text-xs font-bold text-slate-800">
                            {isCartUpdating ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                            ) : (
                              cartQuantity
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleUpdateCartQuantity(product.id, cartQuantity + 1)
                            }
                            disabled={isCartUpdating}
                            className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-50 transition-colors"
                          >
                            <FiPlus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToOrder(product.id)}
                          disabled={isCartUpdating}
                          className="w-full rounded-lg bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center transition-colors"
                        >
                          {isCartUpdating ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                          ) : (
                            "Add to Order"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div ref={loadMoreTriggerRef} className="h-8 w-full mt-2" />
          {loadingMoreProducts && (
            <div className="py-6 text-center text-sm text-slate-500">
              Loading more products...
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default function DealerProductListingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1600px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-screen">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-white rounded-xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        </div>
      }
    >
      <DealerProductListingContent />
    </Suspense>
  );
}
