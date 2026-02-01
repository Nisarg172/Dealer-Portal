"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  category_name: string;
  base_price: number;
  discounted_price: number;
  image_url: string | null;
};

type Category = {
  id: string;
  name: string;
};

export default function DealerProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- Fetch categories -------- */
  useEffect(() => {
    apiClient.get("/categories").then((res) => {
      setCategories(res.data.categories);
    });
  }, []);

  /* -------- Fetch products -------- */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const res = await apiClient.get("/dealer/products", {
        params: {
          search,
          category_id: activeCategory,
        },
      });
      setProducts(res.data.products);
      setLoading(false);
    };

    fetchProducts();
  }, [search, activeCategory]);

  /* -------- Helper to calculate discount percentage -------- */
  const getDiscountPercentage = (base: number, discounted: number) => {
    return Math.round(((base - discounted) / base) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Products</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded"
      />

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1 rounded ${
            !activeCategory ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1 rounded ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasDiscount = product.discounted_price < product.base_price;

            return (
              <Link href={`/dealer/product/${product.id}`} key={product.id}>
                <div className="bg-white rounded shadow hover:shadow-lg transition cursor-pointer">
                  <Image
                    src={product.image_url || "/images/product_dummy.png"}
                    alt={product.name}
                    loading="lazy"
                    width={300}
                    height={300}
                    quality={50}
                    className="h-48 w-full object-cover rounded-t"
                  />

                  <div className="p-4">
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-500">
                      {product.category_name}
                    </p>
                    {/* Price */}
                    <div className="mt-2 flex flex-col items-start gap-1">
                      {hasDiscount ? (
                        <>
                          <p className="text-lg font-bold text-blue-600">
                            ₹{product.discounted_price.toFixed(2)}
                          </p>

                          <div className="flex gap-x-2">
                            <span className="text-gray-400 line-through text-sm">
                              ₹{product.base_price.toFixed(2)}
                              {"  "}
                            </span>{" "}

                            <span className="text-sm text-green-600 font-semibold">
                              {getDiscountPercentage(
                                product.base_price,
                                product.discounted_price
                              )}
                              % off
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-blue-600">
                          ₹{product.base_price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

