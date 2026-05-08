"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { FiArrowLeft } from "react-icons/fi";
import Image from "next/image";

type ProductDetails = {
  id: string;
  name: string;
  category_name: string;
  description: string;
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

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600"
      >
        <FiArrowLeft />
        Back
      </button>

      <div className="bg-white rounded-lg shadow p-6 lg:flex gap-8">

        {/* Image */}
        <div className="lg:w-1/2">
          {product.images_urls?.length ? (
            <Image
            quality={70}
              src={product.images_urls[0]}
              alt={product.name}
              className="w-full h-96 object-contain"
              width={1000}
              height={1000}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col justify-between">

          <div>

            <h1 className="text-3xl font-bold mb-2">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-3">
              Category: {product.category_name}
            </p>

            {/* Price */}
            <div className="flex items-center gap-4 mb-4">

              <span className="text-3xl font-bold text-blue-600">
                ₹{product.discounted_price.toFixed(2)}
              </span>

              {product.base_price &&
                product.base_price > product.discounted_price && (
                  <>
                    <span className="line-through text-gray-400">
                      ₹{product.base_price.toFixed(2)}
                    </span>

                    <span className="text-green-600 font-semibold">
                      {Math.round(
                        ((product.base_price -
                          product.discounted_price) /
                          product.base_price) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}

            </div>

            <p className="mb-4">{product.description}</p>

            {/* Links */}

            {product.product_url && (
              <p>
                <a
                  href={product.product_url}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Product
                </a>
              </p>
            )}

            {product.datasheet_url && (
              <p>
                <a
                  href={product.datasheet_url}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Download Datasheet
                </a>
              </p>
            )}

          </div>

          {/* Cart Controls */}

          <div className="mt-6">

            {!isInCart ? (

              <div className="flex items-center gap-4">

                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="w-20 border px-3 py-2 rounded"
                />

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-70 min-w-[120px] flex items-center justify-center"
                >
                  {addingToCart ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  ) : (
                    "Add to Order"
                  )}
                </button>

              </div>

            ) : (

              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center border rounded w-fit">

                  <button
                    onClick={() =>
                      updateQuantity(product.id,cartQuantity - 1)
                    }
                    disabled={updatingCart}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                  >
                    −
                  </button>

                  <div className="px-6 py-2 font-semibold min-w-[72px] text-center flex items-center justify-center">
                    {updatingCart ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                    ) : (
                      cartQuantity
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updateQuantity(product.id,cartQuantity + 1)
                    }
                    disabled={updatingCart}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                  >
                    +
                  </button>

                </div>

              </div>

            )}

            {message && (
              <p className="mt-2 text-sm text-green-600">
                {message}
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
