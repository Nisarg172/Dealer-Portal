"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { FiArrowLeft } from "react-icons/fi";

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
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/dealer/products/${productId}`);
        setProduct(response.data.product);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to fetch product details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductDetails();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setAddToCartError(null);
    setAddToCartSuccess(null);

    try {
      const response = await apiClient.post("/dealer/cart", {
        productId: product.id,
        quantity,
      });

      if (response.data.success) {
        setAddToCartSuccess(`${quantity} of ${product.name} added to cart!`);
      } else {
        setAddToCartError(response.data.error || "Failed to add to cart.");
      }
    } catch (err: any) {
      setAddToCartError(
        err.response?.data?.error || "Unexpected error adding to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading product details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-700 text-center">
        Product not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-2">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-2 inline-flex items-center gap-2 text-lg font-medium text-gray-600 hover:text-blue-600 transition"
      >
        <FiArrowLeft className="text-lg" />
        Back
      </button>

      <div className="bg-white rounded-lg  p-6 lg:flex lg:space-x-8">
        {/* Images */}
        <div className="lg:w-1/2 mb-6 lg:mb-0">
          {product.images_urls?.length ? (
            <img
              src={product.images_urls[0]}
              alt={product.name}
              className="w-full h-96 object-contain rounded-md shadow"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-md text-gray-500">
              No Image Available
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Category: {product.category_name}
            </p>

            <div className="flex items-baseline justify-between mb-4">
              <p className="text-3xl font-bold text-blue-600">
                ₹{product.discounted_price.toFixed(2)}
              </p>

              {product.base_price &&
                product.base_price > product.discounted_price && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-sm">
                      ₹{product.base_price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 font-semibold">
                      {Math.round(
                        ((product.base_price - product.discounted_price) /
                          product.base_price) *
                          100
                      )}
                      % off
                    </span>
                  </div>
                )}
            </div>

            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Description
            </h2>
            <p className="text-gray-700 mb-4">{product.description}</p>


            {product.product_url && ( <p className="mb-2"> Product URL:{' '} <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" > View Product </a> </p> )} {product.datasheet_url && ( <p className="mb-4"> Datasheet:{' '} <a href={product.datasheet_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" > Download </a> </p> )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-4">
            <label className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">
              Quantity:
            </label>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 px-3 py-2 border rounded-md text-lg"
            />
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          {addToCartSuccess && (
            <p className="text-green-600 mt-2">{addToCartSuccess}</p>
          )}
          {addToCartError && (
            <p className="text-red-600 mt-2">{addToCartError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
