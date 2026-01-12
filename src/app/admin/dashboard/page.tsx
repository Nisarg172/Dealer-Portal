'use client';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Dashboard Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Dealer Management</h2>
          <p className="text-gray-600">Manage all dealer accounts, create new ones, and update existing ones.</p>
          <a href="/admin/dealers" className="mt-4 inline-block text-blue-600 hover:text-blue-800">Go to Dealers &rarr;</a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Product & Category Management</h2>
          <p className="text-gray-600">Oversee product listings and organize them into categories.</p>
          <a href="/admin/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800">Go to Products &rarr;</a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Management</h2>
          <p className="text-gray-600">View and manage all incoming and past orders from dealers.</p>
          <a href="/admin/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">Go to Orders &rarr;</a>
        </div>
      </div>
    </div>
  );
}