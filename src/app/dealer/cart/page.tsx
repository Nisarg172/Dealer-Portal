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

const GST_PERCENT = 18;

export default function DealerCartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  /* ---------------- FETCH CART ---------------- */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/dealer/cart');
      setCartItems(res.data.cartItems || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ---------------- UPDATE QTY ---------------- */
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      setActionLoading(true);
      await apiClient.put('/dealer/cart', {
        updates: [{ productId, quantity }],
      });
      await fetchCart();
    } catch {
      setError('Failed to update quantity');
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = async (productId: string) => {
    try {
      setActionLoading(true);
      await apiClient.put('/dealer/cart', {
        updates: [{ productId, remove: true }],
      });
      await fetchCart();
    } catch {
      setError('Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- PRICE CALC ---------------- */
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.current_discounted_price * item.quantity,
    0
  );

  const gstAmount = (subTotal * GST_PERCENT) / 100;
  const grandTotal = subTotal + gstAmount;

  /* ---------------- PLACE ORDER ---------------- */
  const placeOrder = async () => {
    try {
      setActionLoading(true);
      await apiClient.post('/dealer/orders', {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_order: item.current_discounted_price,
        })),
        subtotal: subTotal,
        gst: gstAmount,
        total_amount: grandTotal,
      });
      setActionLoading(false);
      setShowSummary(false);
      router.push('/dealer/orders');
    } catch {
      setError('Failed to place order');
    } finally {
      setActionLoading(false);
      setShowSummary(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) return <p className="p-6">Loading cart...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          Your cart is empty.{' '}
          <Link href="/dealer/products" className="text-blue-600 underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Total</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-4 font-medium">
                    {item.products.name}
                  </td>
                  <td className="p-4">
                    ₹{item.current_discounted_price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={actionLoading}
                      onChange={e =>
                        updateQuantity(item.product_id, +e.target.value)
                      }
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-4">
                    ₹
                    {(item.current_discounted_price * item.quantity).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SUMMARY */}
          <div className="p-6 border-t flex justify-between items-center">
            <div>
              <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
              <p>GST (18%): ₹{gstAmount.toFixed(2)}</p>
              <p className="text-xl font-bold mt-2">
                Total: ₹{grandTotal.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => setShowSummary(true)}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ORDER SUMMARY MODAL ---------------- */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <ul className="space-y-2 text-sm">
              {cartItems.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.products.name} × {item.quantity}
                  </span>
                  <span>
                    ₹
                    {(item.current_discounted_price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t mt-4 pt-4 space-y-1">
              <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
              <p>GST (18%): ₹{gstAmount.toFixed(2)}</p>
              <p className="font-bold text-lg">
                Grand Total: ₹{grandTotal.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={actionLoading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}

