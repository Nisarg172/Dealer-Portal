'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/axios';

type Product = {
  id: string;
  name: string;
  category_name: string; // Assuming API returns category name directly or as a nested object
  discounted_price: number; // Price already discounted by the backend
  // image_url: string; // Placeholder for product image
};

export default function DealerProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/dealer/products'); // API returns allowed and discounted products
        setProducts(response.data.products);
      } catch (err: any) {
        console.error('Error fetching dealer products:', err);
        setError(err.response?.data?.error || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Products</h1>
      
      {products.length === 0 ? (
        <p className="text-gray-700">No products found. Please check your visibility settings or contact admin.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link href={`/dealer/product/${product.id}`} key={product.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200">
                {/* <img src={product.image_url || '/placeholder-product.png'} alt={product.name} className="w-full h-48 object-cover" /> */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h2>
                  <p className="text-gray-600 text-sm mb-2">{product.category_name}</p>
                  <p className="text-xl font-bold text-blue-600">₹{product.discounted_price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
