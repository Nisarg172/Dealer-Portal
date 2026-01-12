'use client';

import Link from 'next/link';

export default function DealerDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dealer Portal</h1>
      <p className="text-gray-700 mb-8">Explore products, manage your cart, and review your orders.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Catalog</h2>
          <p className="text-gray-600">Browse through products available to you with your special pricing.</p>
          <Link href="/dealer/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800">View Products &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Cart</h2>
          <p className="text-gray-600">Review items in your cart and proceed to order.</p>
          <Link href="/dealer/cart" className="mt-4 inline-block text-blue-600 hover:text-blue-800">Go to Cart &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Orders</h2>
          <p className="text-gray-600">Track the status of your past and current orders.</p>
          <Link href="/dealer/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">View Orders &rarr;</Link>
        </div>
      </div>
    </div>
  );
}