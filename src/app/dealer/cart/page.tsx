'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/axios';
import Link from 'next/link';

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  price_at_addition: number;
  current_discounted_price: number;
  products: {
    id: string;
    name: string;
  };
};

export default function DealerCartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ----------------------------------------
     FETCH CART FROM API
  ---------------------------------------- */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dealer/cart');
      setCartItems(res.data.cartItems || []);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ----------------------------------------
     UPDATE QUANTITY
  ---------------------------------------- */
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setActionLoading(true);
      await apiClient.put('/dealer/cart', {
        updates: [{ productId, quantity }],
      });
      await fetchCart();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  /* ----------------------------------------
     REMOVE ITEM
  ---------------------------------------- */
  const removeItem = async (productId: string) => {
    try {
      setActionLoading(true);
      await apiClient.put('/dealer/cart', {
        updates: [{ productId, remove: true }],
      });
      await fetchCart();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  /* ----------------------------------------
     TOTAL CALCULATION (UI ONLY)
  ---------------------------------------- */
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.current_discounted_price * item.quantity,
    0
  );

  /* ----------------------------------------
     PLACE ORDER
  ---------------------------------------- */
  const placeOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      setActionLoading(true);
      setError(null);

      await apiClient.post('/dealer/orders', {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_order: item.current_discounted_price,
        })),
        total_amount: totalAmount,
      });

      setSuccess('Order placed successfully!');
      router.push('/dealer/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setActionLoading(false);
    }
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */
  if (loading) {
    return <p className="p-6 text-gray-600">Loading cart...</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p>
            Your cart is empty.{' '}
            <Link href="/dealer/products" className="text-blue-600 underline">
              Browse products
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.products.name}</td>
                    <td className="p-3">
                      ₹{item.current_discounted_price.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        disabled={actionLoading}
                        onChange={e =>
                          updateQuantity(
                            item.product_id,
                            Number(e.target.value)
                          )
                        }
                        className="w-20 border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      ₹
                      {(
                        item.current_discounted_price * item.quantity
                      ).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => removeItem(item.product_id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-xl font-bold">
              Total: ₹{totalAmount.toFixed(2)}
            </p>
            <button
              onClick={placeOrder}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}
          {success && <p className="text-green-600 mt-4">{success}</p>}
        </div>
      )}
    </div>
  );
}
