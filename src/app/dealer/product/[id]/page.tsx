"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";
import parse from "html-react-parser";

type ProductDetails = {
  id: string;
  name: string;
  category_name: string;
  description: string | null;
  long_description?: string | null;
  discounted_price: number;
  base_price?: number;
  product_url?: string;
  datasheet_url?: string;
  images_urls?: string[];
};

export default function DealerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: productId } = params as { id: string };

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart states
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "documents">(
    "description"
  );

  // Fetch product + cart

  const fetchData = async (showPageLoader = false) => {
      try {
        if (showPageLoader) {
          setLoading(true);
        }
        setError(null);

        // Fetch product
        const productResponse = await apiClient.get(
          `/dealer/products/${productId}`
        );
        const productData = productResponse.data.product;
        setProduct(productData);

        // Fetch cart
        const cartResponse = await apiClient.get("/dealer/cart");

        const cartItem = cartResponse.data.cartItems?.find(
          (item: any) => item.product_id === productId
        );

        if (cartItem) {
          setIsInCart(true);
          setCartQuantity(cartItem.quantity);
        } else {
          setIsInCart(false);
          setCartQuantity(0);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to fetch product details."
        );
      } finally {
        if (showPageLoader) {
          setLoading(false);
        }
      }
    };
  useEffect(() => {
    

    if (productId) fetchData(true);
  }, [productId]);

  // Add to Order
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      setMessage(null);

      await apiClient.post("/dealer/cart", {
        productId: product.id,
        quantity: quantity,
      });

      setIsInCart(true);
      setCartQuantity(quantity);

      setMessage("Added to cart successfully");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Failed to Add to Order");
    } finally {
      setAddingToCart(false);
    }
  };

  // Update quantity
   const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeItem(productId);
      return;
    }
    try {
      setUpdatingCart(true);
      await apiClient.put("/dealer/cart", {
        updates: [{ productId, quantity }],
      });
      setCartQuantity(quantity);
    } catch {
      setError("Failed to update quantity");
    } finally {
      setUpdatingCart(false);
    }
  };

    const removeItem = async (productId: string) => {
    try {
      setUpdatingCart(true);
      await apiClient.put("/dealer/cart", {
        updates: [{ productId, remove: true }],
      });
      setIsInCart(false);
      setCartQuantity(0);
      setQuantity(1);
    } catch {
      setError("Failed to remove item");
    } finally {
      setUpdatingCart(false);
    }
  };


  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[40vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Product not found
      </div>
    );
  }

  const hasDiscount =
    Boolean(product.base_price) && product.base_price! > product.discounted_price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.base_price! - product.discounted_price) / product.base_price!) *
          100
      )
    : 0;
  const messageIsError = Boolean(message && /failed|error/i.test(message));

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow"
      >
        <FiArrowLeft />
        Back
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
        <div className="grid gap-0 lg:grid-cols-2">

          {/* Image */}
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 sm:p-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              {product.images_urls?.length ? (
                <Image
                  quality={70}
                  src={product.images_urls[0]}
                  alt={product.name}
                  className="h-72 w-full object-contain sm:h-96"
                  width={1000}
                  height={1000}
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:h-96">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between p-6 sm:p-8">

            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                {product.category_name}
              </span>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {product.description}
              </p>

              {/* Price */}
              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-bold tracking-tight text-blue-700">
                    ₹{product.discounted_price.toFixed(2)}
                  </span>

                  {hasDiscount && (
                    <>
                      <span className="text-lg text-slate-400 line-through">
                        ₹{product.base_price!.toFixed(2)}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Inclusive pricing for your dealer account.
                </p>
              </div>

              {/* <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Availability
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">In stock</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Cart Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {isInCart ? `${cartQuantity} item(s) in cart` : "Not added yet"}
                  </p>
                </div>
              </div> */}
            </div>

            {/* Cart Controls */}
            <div className="mt-8">
              {!isInCart ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Quantity
                    </p>
                    <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 text-lg text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-20 border-x border-slate-200 px-3 py-2 text-center font-semibold text-slate-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="px-4 py-2 text-lg text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="inline-flex min-w-[180px] items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {addingToCart ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    ) : (
                      "Add to Order"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Already in cart
                  </p>
                  <div className="inline-flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <button
                      onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                      disabled={updatingCart}
                      className="px-5 py-2.5 text-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60"
                    >
                      −
                    </button>
                    <div className="flex min-w-[84px] items-center justify-center border-x border-slate-200 px-5 py-2.5 font-semibold text-slate-800">
                      {updatingCart ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                      ) : (
                        cartQuantity
                      )}
                    </div>
                    <button
                      onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                      disabled={updatingCart}
                      className="px-5 py-2.5 text-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <p
                  className={`mt-3 text-sm font-medium ${
                    messageIsError ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Description / Documents Tabs */}
      {/* <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "description"
                ? "bg-white text-slate-900 border border-slate-200 border-b-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`ml-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "documents"
                ? "bg-white text-slate-900 border border-slate-200 border-b-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Documents
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {activeTab === "description" ? (
            <div className="space-y-5">
              <p className="text-lg text-gray-900">
                <span className="font-semibold">{product.name}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span>{product.description || "No description available."}</span>
              </p>

              {product.long_description ? (
                <div
                  className="max-w-none text-slate-700 text-[14px] leading-[1.6] [&_p]:my-2 [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-blue-700 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6 [&_ol]:my-3 [&_li]:my-1 [&_img]:max-w-full [&_img]:h-auto [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-slate-300 [&_th]:border-slate-300 [&_td]:p-2 [&_th]:p-2"
                  style={{ fontFamily: "Inter, Arial, sans-serif" }}
                >
                  {parse(product.long_description)}
                </div>
              ) : (
                <p className="text-gray-500">No long description available.</p>
              )}
            </div>
          ) : (
            <div>
              <p className="mb-3 text-base font-semibold text-gray-900">
                Available Documents:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  {product.datasheet_url ? (
                    <a
                      href={product.datasheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Datasheet Link
                    </a>
                  ) : (
                    <span className="text-gray-500">
                      Datasheet Link not available
                    </span>
                  )}
                </li>
                <li>
                  {product.product_url ? (
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Product Web URL
                    </a>
                  ) : (
                    <span className="text-gray-500">
                      Product Web URL not available
                    </span>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div> */}


    </div>
  );
}
