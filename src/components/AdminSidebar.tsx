import Link from 'next/link';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul>
          <li>
            <Link href="/admin/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/dealers" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Dealers
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Categories
            </Link>
          </li>
          <li>
            <Link href="/admin/products" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Products
            </Link>
          </li>
          <li>
            <Link href="/admin/discounts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Discounts
            </Link>
          </li>
          <li>
            <Link href="/admin/visibility" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Visibility
            </Link>
          </li>
          <li>
            <Link href="/admin/orders" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
              Orders
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

