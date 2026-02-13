"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  price_at_addition: number;
  current_discounted_price: number;
  products: {
    id: string;
    name: string;
    image_url?: string; // Added image support
    category_name?: string;
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

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/dealer/cart");
      setCartItems(res.data.cartItems || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      setActionLoading(true);
      await apiClient.put("/dealer/cart", {
        updates: [{ productId, quantity }],
      });
      await fetchCart();
    } catch {
      setError("Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setActionLoading(true);
      await apiClient.put("/dealer/cart", {
        updates: [{ productId, remove: true }],
      });
      await fetchCart();
    } catch {
      setError("Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  };

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.current_discounted_price * item.quantity,
    0
  );
  const gstAmount = (subTotal * GST_PERCENT) / 100;
  const grandTotal = subTotal + gstAmount;

  const placeOrder = async () => {
    try {
      setActionLoading(true);
      await apiClient.post("/dealer/orders", {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_order: item.current_discounted_price,
        })),
        subtotal: subTotal,
        gst: gstAmount,
        total_amount: grandTotal,
      });
      router.push("/dealer/orders");
    } catch {
      setError("Failed to place order");
    } finally {
      setActionLoading(false);
      setShowSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-[#fcfcfc] min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
          <FiShoppingBag size={24} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center shadow-sm"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is feeling light</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything to your order yet.</p>
          <Link
            href="/dealer/products"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Start Shopping <FiArrowRight />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEFT: ITEM LIST --- */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50">
                    <Image
                      src={item.products.image_url || "/images/product_dummy.png"}
                      alt={item.products.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                      {item.products.name}
                    </h3>
                    <p className="text-indigo-500 text-xs font-black uppercase tracking-widest">
                      Unit Price: ₹{item.current_discounted_price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={actionLoading || item.quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 transition-all"
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={actionLoading}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right min-w-[120px]">
                    <p className="font-black text-slate-900 text-lg">
                      ₹{(item.current_discounted_price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-rose-500 hover:text-rose-700 text-sm font-bold flex items-center gap-1 ml-auto mt-1 transition-colors"
                    >
                      <FiTrash2 size={14} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* --- RIGHT: STICKY SUMMARY --- */}
          <div className="lg:col-span-4 sticky top-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
              {/* Decorative Circle */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
              
              <h2 className="text-xl font-bold mb-8 relative">Order Summary</h2>
              
              <div className="space-y-4 relative">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">₹{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>GST (18%)</span>
                  <span className="text-white font-bold">₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-800 my-6"></div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 font-medium">Grand Total</span>
                  <span className="text-3xl font-black text-indigo-400">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setShowSummary(true)}
                className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Checkout Now <FiArrowRight />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Secure Dealer Checkout
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">Confirm Your Order</h2>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-3 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-slate-600">
                      <span className="font-bold text-slate-900">{item.quantity}x</span> {item.products.name}
                    </span>
                    <span className="font-bold text-slate-900">₹{(item.current_discounted_price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-2 mb-8">
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Subtotal + GST</span>
                  <span>₹{subTotal.toLocaleString()} + ₹{gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-xl pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-indigo-600">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSummary(false)}
                  className="py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Back to Cart
                </button>
                <button
                  onClick={placeOrder}
                  disabled={actionLoading}
                  className="py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {actionLoading ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
}