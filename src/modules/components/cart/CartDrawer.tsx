"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/modules/context/CartContext";

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

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
      console.error("Cart drawer checkout error:", err);
      if (cart.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      } else {
        setIsCheckingOut(false);
      }
    }
  };

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const lines = cart?.lines.nodes || [];
  const subtotal = cart?.cost?.subtotalAmount;
  const currency = subtotal?.currencyCode === "INR" ? "₹" : subtotal?.currencyCode || "₹";
  const subtotalNum = subtotal ? parseFloat(subtotal.amount) : 0;
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotalNum / freeShippingThreshold) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Slide-over panel */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-primary">Your Cart</h2>
            {cart && cart.totalQuantity > 0 && (
              <span className="bg-secondary text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                {cart.totalQuantity}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 -mr-2 text-muted-light hover:text-primary rounded-full hover:bg-secondary transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free shipping bar */}
        <div className="bg-[#FAF9F7] px-6 py-3 border-b border-border/60">
          <div className="flex justify-between items-center text-xs font-medium text-muted mb-1.5">
            <span>
              {subtotalNum >= freeShippingThreshold
                ? "🎉 You've unlocked Free Express Shipping!"
                : `Add ${currency}${(freeShippingThreshold - subtotalNum).toFixed(0)} more for Free Shipping`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 3.5h2.8l2.6 11.2a1.5 1.5 0 001.46 1.16h8.74a1.5 1.5 0 001.46-1.16l1.8-8.2H6.2" />
                </svg>
              </div>
              <p className="text-lg font-bold text-primary mb-1">Your cart is empty</p>
              <p className="text-sm text-muted mb-6">Looks like you haven&apos;t added any items yet.</p>
              <button
                type="button"
                onClick={closeCart}
                className="bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            lines.map((line) => {
              const merchandise = line.merchandise;
              const unitPrice = parseFloat(merchandise.price.amount);
              const lineTotal = parseFloat(line.cost.totalAmount.amount);

              return (
                <div
                  key={line.id}
                  className="flex gap-4 p-3.5 rounded-2xl border border-border/80 bg-white hover:border-border transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F0EEED] shrink-0 flex items-center justify-center">
                    {merchandise.image?.url ? (
                      <Image
                        src={merchandise.image.url}
                        alt={merchandise.image.altText || merchandise.product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <span className="text-xs text-muted">No Image</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${merchandise.product.handle}`}
                          onClick={closeCart}
                          className="font-bold text-sm text-primary hover:underline line-clamp-1"
                        >
                          {merchandise.product.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(line.id)}
                          disabled={isLoading}
                          className="text-muted-light hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {merchandise.title && merchandise.title !== "Default Title" && (
                        <p className="text-xs text-muted mt-0.5">{merchandise.title}</p>
                      )}

                      <p className="text-xs font-semibold text-primary mt-1">
                        {currency}
                        {unitPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center bg-secondary rounded-full px-2 py-0.5 gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, line.quantity - 1)}
                          disabled={isLoading}
                          className="w-5 h-5 flex items-center justify-center text-primary hover:text-muted disabled:opacity-50 text-sm font-bold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-xs font-bold text-primary min-w-[16px] text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-5 h-5 flex items-center justify-center text-primary hover:text-muted disabled:opacity-50 text-sm font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-black text-primary">
                        {currency}
                        {lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="p-6 border-t border-border bg-white space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">
                  {currency}
                  {subtotalNum.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span>{subtotalNum >= freeShippingThreshold ? "FREE" : "Calculated at checkout"}</span>
              </div>
              <div className="flex justify-between text-base font-black text-primary pt-2 border-t border-border">
                <span>Estimated Total</span>
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
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
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

            <p className="text-[11px] text-center text-muted">
              🔒 Taxes and shipping calculated during Shopify secure checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
