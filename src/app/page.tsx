"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Dealer Portal</h1>
        <Link
          href="/login"
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center max-w-7xl mx-auto px-8 py-20 gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Smart Dealer{" "}
            <span className="text-blue-600">Management Portal</span>
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Manage products, orders, pricing, and customers in one powerful
            platform designed for modern dealers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Login to Dashboard
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 flex justify-center">
          <div className="flex-1 flex justify-center">
            <svg
              width="420"
              height="420"
              viewBox="0 0 420 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-md"
            >
              <rect width="420" height="420" rx="24" fill="#EFF6FF" />

              <rect
                x="60"
                y="80"
                width="300"
                height="220"
                rx="16"
                fill="white"
              />
              <rect
                x="60"
                y="80"
                width="300"
                height="48"
                rx="16"
                fill="#2563EB"
              />

              <circle cx="90" cy="104" r="6" fill="white" />
              <circle cx="110" cy="104" r="6" fill="white" />
              <circle cx="130" cy="104" r="6" fill="white" />

              <rect
                x="90"
                y="150"
                width="200"
                height="14"
                rx="7"
                fill="#E5E7EB"
              />
              <rect
                x="90"
                y="180"
                width="240"
                height="14"
                rx="7"
                fill="#E5E7EB"
              />
              <rect
                x="90"
                y="210"
                width="180"
                height="14"
                rx="7"
                fill="#E5E7EB"
              />

              <rect
                x="90"
                y="250"
                width="100"
                height="32"
                rx="8"
                fill="#2563EB"
              />
              <rect
                x="200"
                y="250"
                width="100"
                height="32"
                rx="8"
                fill="#DBEAFE"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            Why Choose Our Portal?
          </h3>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: "Order Management",
                desc: "Track, manage, and fulfill orders with real-time updates.",
              },
              {
                title: "Dealer Pricing",
                desc: "Dynamic pricing, discounts, and dealer-level visibility.",
              },
              {
                title: "Secure & Fast",
                desc: "Role-based access, high performance, and secure data.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border hover:shadow-lg transition bg-gray-50"
              >
                <h4 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h4>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-gray-50">
        © {new Date().getFullYear()} Dealer Portal. All rights reserved.
      </footer>
    </main>
  );
}
