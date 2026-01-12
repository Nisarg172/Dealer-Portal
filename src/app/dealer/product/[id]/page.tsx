'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/axios';

type ProductDetails = {
  id: string;
  name: string;
  category_name: string; // Assuming API returns category name
  description: string;
  discounted_price: number; // Price already discounted by the backend
  // images: string[]; // Placeholder for multiple image URLs
};

export default function DealerProductDetailPage() {
  const params = useParams();
  const { id: productId } = params as { id: string };

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // For adding to cart

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/dealer/products/${productId}`); // Assuming GET /api/dealer/products/[id] exists
        setProduct(response.data.product);
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.error || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [addToCartSuccess, setAddToCartSuccess] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    setAddToCartError(null);
    setAddToCartSuccess(null);
    try {
      const response = await apiClient.post('/dealer/cart', {
        productId: product.id,
        quantity: quantity,
      });
      if (response.data.success) {
        setAddToCartSuccess(`${quantity} of ${product.name} added to cart!`);
        // Optionally, redirect to cart page
        // router.push('/dealer/cart');
      } else {
        setAddToCartError(response.data.error || 'Failed to add to cart.');
      }
    } catch (err: any) {
      setAddToCartError(err.response?.data?.error || 'An unexpected error occurred while adding to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-gray-700">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
        <p className="text-gray-600 text-lg mb-4">Category: {product.category_name}</p>

        {/* Product Images Placeholder */}
        <div className="mb-6">
          {/* {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="w-full max-h-96 object-contain rounded-md" />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-md text-gray-500">No Image Available</div>
          )} */}
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-md text-gray-500">Product Image Placeholder</div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-700">{product.description}</p>
        </div>

        <div className="flex items-baseline mb-6">
          <p className="text-3xl font-bold text-blue-600 mr-4">₹{product.discounted_price.toFixed(2)}</p>
          {/* Original price if needed for comparison */}
          {/* <p className="text-lg text-gray-500 line-through">₹{product.original_price.toFixed(2)}</p> */}
        </div>

        <div className="flex items-center space-x-4">
          <label htmlFor="quantity" className="block text-lg font-medium text-gray-700">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
