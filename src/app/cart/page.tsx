"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/modules/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const lines = cart?.lines.nodes || [];
  const subtotal = cart?.cost?.subtotalAmount;
  const currency = subtotal?.currencyCode === "INR" ? "₹" : subtotal?.currencyCode || "₹";
  const subtotalNum = subtotal ? parseFloat(subtotal.amount) : 0;
  const freeShippingThreshold = 999;

  const handleCheckout = async () => {
    if (!cart?.id || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (cart.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      } else {
        throw new Error(data.error || "Unable to proceed to checkout");
      }
    } catch (err) {
      console.error("Checkout redirect error:", err);
      if (cart.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      } else {
        setIsCheckingOut(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 font-medium mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>&rsaquo;</span>
          <span className="text-primary font-bold">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary mb-8">
          Your Shopping Cart {cart && cart.totalQuantity > 0 && `(${cart.totalQuantity})`}
        </h1>

        {lines.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl bg-[#FAF9F7] border border-black/5 text-center max-w-lg mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto flex items-center justify-center text-muted">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 3.5h2.8l2.6 11.2a1.5 1.5 0 001.46 1.16h8.74a1.5 1.5 0 001.46-1.16l1.8-8.2H6.2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary">Your cart is empty</h2>
            <p className="text-sm text-muted">
              Explore our curated collections and discover pieces that suit your style.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block bg-primary hover:bg-neutral-800 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Cart Lines List */}
            <div className="lg:col-span-8 space-y-4">
              {lines.map((line) => {
                const merchandise = line.merchandise;
                const unitPrice = parseFloat(merchandise.price.amount);
                const lineTotal = parseFloat(line.cost.totalAmount.amount);

                return (
                  <div
                    key={line.id}
                    className="p-5 sm:p-6 rounded-3xl border border-border bg-white flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Image */}
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#F0EEED] shrink-0">
                        {merchandise.image?.url ? (
                          <Image
                            src={merchandise.image.url}
                            alt={merchandise.image.altText || merchandise.product.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Title & Options */}
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/product/${merchandise.product.handle}`}
                          className="font-bold text-base sm:text-lg text-primary hover:underline line-clamp-1"
                        >
                          {merchandise.product.title}
                        </Link>
                        {merchandise.title && merchandise.title !== "Default Title" && (
                          <p className="text-xs text-muted">Variant: {merchandise.title}</p>
                        )}
                        <p className="text-sm font-semibold text-primary">
                          {currency}
                          {unitPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls & Line Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="flex items-center bg-[#F0EEED] rounded-full px-3 py-1.5 gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center text-primary hover:text-muted disabled:opacity-40 font-bold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-primary min-w-[20px] text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-6 h-6 flex items-center justify-center text-primary hover:text-muted disabled:opacity-40 font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-lg font-black text-primary min-w-[80px] text-right">
                        {currency}
                        {lineTotal.toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="text-muted-light hover:text-rose-600 p-2 transition-colors rounded-full hover:bg-rose-50"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#FAF9F7] border border-black/5 space-y-6">
              <h2 className="text-xl font-black uppercase text-primary">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold text-primary">
                    {currency}
                    {subtotalNum.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">
                    {subtotalNum >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between text-lg font-black text-primary">
                  <span>Total</span>
                  <span>
                    {currency}
                    {subtotalNum.toLocaleString()}
                  </span>
                </div>
              </div>

              {cart?.checkoutUrl ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isLoading}
                  className="w-full bg-primary hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] text-center"
                >
                  {isCheckingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Preparing Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Shopify Checkout</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-full text-center"
                >
                  Checkout Unavailable
                </button>
              )}

              <div className="space-y-2 text-xs text-muted text-center">
                <p>🔒 Shopify 256-bit encrypted secure checkout</p>
                <p>Accepts UPI, Cards, NetBanking &amp; Cash on Delivery</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
