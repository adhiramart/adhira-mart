"use client";

import React, { useState, useMemo } from "react";
import {
  ShopifyProductDetail,
  ShopifyProductVariant,
} from "@/lib/products";
import { useCart } from "@/modules/context/CartContext";

interface ProductInfoSectionProps {
  product: ShopifyProductDetail;
  selectedVariant: ShopifyProductVariant | null;
  onSelectVariant: (variant: ShopifyProductVariant) => void;
}

// Map common color names to CSS colors
const COLOR_MAP: Record<string, string> = {
  black: "#111111",
  white: "#FFFFFF",
  olive: "#4B5320",
  green: "#2E5D4B",
  navy: "#1B2A4A",
  blue: "#2563EB",
  red: "#DC2626",
  brown: "#78350F",
  beige: "#D4C5B9",
  grey: "#6B7280",
  gray: "#6B7280",
  cream: "#FFFDD0",
  pink: "#EC4899",
  yellow: "#EAB308",
  purple: "#8B5CF6",
  charcoal: "#374151",
  sage: "#9CA986",
  mustard: "#D97706",
};

export default function ProductInfoSection({
  product,
  selectedVariant,
  onSelectVariant,
}: ProductInfoSectionProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">("details");

  // Determine current price and compare-at price
  const priceObj = selectedVariant?.price || product.priceRange.minVariantPrice;
  const compareAtPriceObj =
    selectedVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice;

  const currentPrice = parseFloat(priceObj.amount);
  const compareAtPrice = compareAtPriceObj ? parseFloat(compareAtPriceObj.amount) : 0;
  const currency = priceObj.currencyCode === "INR" ? "₹" : priceObj.currencyCode === "USD" ? "$" : priceObj.currencyCode;

  // Calculate discount percentage
  const discountPercent =
    compareAtPrice > currentPrice
      ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
      : null;

  // Selected options state map: e.g. { "Size": "Large", "Color": "Olive" }
  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (selectedVariant) {
      for (const opt of selectedVariant.selectedOptions) {
        map[opt.name] = opt.value;
      }
    }
    return map;
  }, [selectedVariant]);

  // Handle option click (Size, Color, etc.)
  const handleOptionChange = (optionName: string, optionValue: string) => {
    const targetOptions = {
      ...selectedOptionsMap,
      [optionName]: optionValue,
    };

    // Find the variant matching all target options
    const match = product.variants.nodes.find((v) =>
      v.selectedOptions.every((opt) => targetOptions[opt.name] === opt.value)
    );

    if (match) {
      onSelectVariant(match);
    } else {
      // Fallback: match variant with this specific option
      const partialMatch = product.variants.nodes.find((v) =>
        v.selectedOptions.some((opt) => opt.name === optionName && opt.value === optionValue)
      );
      if (partialMatch) onSelectVariant(partialMatch);
    }
  };

  const isAvailable = selectedVariant
    ? selectedVariant.availableForSale
    : product.availableForSale;

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedVariant || !isAvailable) return;
    setFeedback(null);
    const success = await addToCart(selectedVariant.id, quantity);
    if (success) {
      setFeedback("Added to cart successfully!");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Instant Buy Now handler
  const handleBuyNow = async () => {
    if (!selectedVariant || !isAvailable || isBuyingNow) return;
    setIsBuyingNow(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Unable to start checkout");
      }
    } catch (err) {
      console.error("Buy Now checkout error:", err);
      setFeedback("Could not proceed to checkout. Please try again.");
      setIsBuyingNow(false);
    }
  };

  // Pincode delivery estimation
  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length < 5) {
      setDeliveryStatus("Please enter a valid 6-digit postal code.");
      return;
    }
    setDeliveryStatus("Standard Delivery: Estimated 3–5 business days • Free Delivery eligible");
  };

  // Share handler
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title & Share Icon Header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-primary leading-[1.1]">
          {product.title}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this product"
          className="p-2.5 rounded-full border border-black/10 hover:bg-secondary text-primary transition-colors shrink-0 relative"
          title="Share product link"
        >
          {copied ? (
            <span className="text-xs font-semibold text-green-600 px-1">Copied!</span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          )}
        </button>
      </div>

      {/* Ratings & Stock Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#FAF9F7] px-3 py-1 rounded-full border border-black/5">
          <div className="flex text-amber-400 text-sm">
            {"★".repeat(4)}
            <span className="text-amber-300">★</span>
          </div>
          <span className="text-xs font-bold text-primary">4.5</span>
          <span className="text-xs text-muted">/ 5</span>
          <span className="text-xs text-muted ml-1">(451 reviews)</span>
        </div>

        {/* Stock Status Pill */}
        {isAvailable ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            In Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Currently Out of Stock
          </span>
        )}

        {product.vendor && (
          <span className="text-xs text-muted font-medium ml-auto">
            Brand: <span className="text-primary font-semibold">{product.vendor}</span>
          </span>
        )}
      </div>

      {/* Price & Discount Display */}
      <div className="flex items-baseline gap-3.5 pb-2">
        <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
          {currency}
          {currentPrice.toLocaleString()}
        </span>

        {compareAtPrice > currentPrice && (
          <span className="text-xl sm:text-2xl font-bold text-gray-400 line-through">
            {currency}
            {compareAtPrice.toLocaleString()}
          </span>
        )}

        {discountPercent !== null && discountPercent > 0 && (
          <span className="bg-rose-100 text-rose-600 text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Short Description */}
      {product.description && (
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
          {product.description}
        </p>
      )}

      <hr className="border-border/80 my-1" />

      {/* Dynamic Shopify Variant Selectors */}
      {product.options && product.options.length > 0 && product.options.some((opt) => opt.name !== "Title") && (
        <div className="space-y-6">
          {product.options.map((option) => {
            if (option.name === "Title") return null;
            const isColor =
              option.name.toLowerCase().includes("color") ||
              option.name.toLowerCase().includes("colour");
            const currentSelectedValue = selectedOptionsMap[option.name] || option.values[0];

            return (
              <div key={option.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary tracking-wide">
                    {isColor ? "Select Colors" : `Choose ${option.name}`}
                  </span>
                  <span className="text-xs font-medium text-muted">
                    Selected: <strong className="text-primary">{currentSelectedValue}</strong>
                  </span>
                </div>

                {/* Color Swatches */}
                {isColor ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    {option.values.map((val) => {
                      const isSelected = currentSelectedValue === val;
                      const colorHex = COLOR_MAP[val.toLowerCase()] || "#333333";

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionChange(option.name, val)}
                          aria-label={`Select color ${val}`}
                          className={`relative w-9 h-9 rounded-full transition-transform flex items-center justify-center ${
                            isSelected
                              ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm"
                              : "hover:scale-105 opacity-90 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: colorHex }}
                          title={val}
                        >
                          {isSelected && (
                            <svg
                              className={`w-4 h-4 ${
                                ["white", "cream", "yellow"].includes(val.toLowerCase())
                                  ? "text-black"
                                  : "text-white"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="3"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Size / Other Pill Buttons */
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {option.values.map((val) => {
                      const isSelected = currentSelectedValue === val;

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionChange(option.name, val)}
                          className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                            isSelected
                              ? "bg-primary text-white shadow-sm scale-[1.02]"
                              : "bg-[#F0EEED] text-neutral-600 hover:bg-neutral-200"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <hr className="border-border/80 my-1" />
        </div>
      )}

      {/* Quantity & Add to Cart Purchase Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Quantity Pill Selector */}
          <div className="flex items-center justify-between bg-[#F0EEED] rounded-full px-5 py-3.5 sm:w-40 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !isAvailable}
              className="text-primary hover:text-muted disabled:opacity-40 text-lg font-bold p-1 select-none"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="font-bold text-primary text-base min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              disabled={quantity >= 10 || !isAvailable}
              className="text-primary hover:text-muted disabled:opacity-40 text-lg font-bold p-1 select-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Primary Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || isLoading}
            className={`flex-1 bg-primary text-white py-4 px-8 rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 ${
              !isAvailable
                ? "opacity-50 cursor-not-allowed bg-neutral-400"
                : "hover:bg-neutral-800"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Adding to Cart...</span>
              </>
            ) : isAvailable ? (
              <span>Add to Cart</span>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>

          {/* Instant Buy Now Button (Reference 2 style) */}
          {isAvailable && (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isLoading || isBuyingNow}
              className="bg-[#008ECC] hover:bg-[#007AB0] text-white py-4 px-8 rounded-full font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] shrink-0 text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBuyingNow ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Redirecting...</span>
                </>
              ) : (
                <span>Buy Now</span>
              )}
            </button>
          )}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Check Delivery Availability Widget (Reference 2 style) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F7] border border-black/5 space-y-3">
        <h4 className="text-sm font-bold text-primary flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Check Delivery Availability</span>
        </h4>

        <form onSubmit={handlePincodeCheck} className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter Postal / Pincode"
            maxLength={6}
            className="flex-1 bg-white border border-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-primary placeholder:text-muted outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Check
          </button>
        </form>

        {deliveryStatus && (
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg">
            {deliveryStatus}
          </p>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 py-2 text-center">
        <div className="p-3 bg-[#FAF9F7] rounded-xl flex flex-col items-center">
          <span className="text-lg">✨</span>
          <span className="text-[11px] font-bold text-primary mt-1">100% Authentic</span>
          <span className="text-[10px] text-muted">Quality Guaranteed</span>
        </div>
        <div className="p-3 bg-[#FAF9F7] rounded-xl flex flex-col items-center">
          <span className="text-lg">🚀</span>
          <span className="text-[11px] font-bold text-primary mt-1">Fast Delivery</span>
          <span className="text-[10px] text-muted">Tracked & Insured</span>
        </div>
        <div className="p-3 bg-[#FAF9F7] rounded-xl flex flex-col items-center">
          <span className="text-lg">🔄</span>
          <span className="text-[11px] font-bold text-primary mt-1">Easy Returns</span>
          <span className="text-[10px] text-muted">7-Day Hassle Free</span>
        </div>
      </div>

      {/* Editorial Content Tabs (Reference 1 style) */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-around border-b border-border text-center text-sm sm:text-base font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-4 transition-all relative ${
              activeTab === "details"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted hover:text-primary"
            }`}
          >
            Product Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 transition-all relative ${
              activeTab === "reviews"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted hover:text-primary"
            }`}
          >
            Rating &amp; Reviews
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`pb-4 transition-all relative ${
              activeTab === "faqs"
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted hover:text-primary"
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === "details" && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.descriptionHtml ? (
                <div
                  className="prose prose-sm max-w-none text-neutral-600"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : (
                <p>{product.description || "Detailed specifications for this curated piece."}</p>
              )}

              {/* Specs Table */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-4 bg-[#FAF9F7] rounded-2xl border border-black/5">
                <div>
                  <span className="text-muted block text-xs">SKU / Variant</span>
                  <span className="font-semibold text-primary text-xs">{selectedVariant?.title || "Default"}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Brand / Vendor</span>
                  <span className="font-semibold text-primary text-xs">{product.vendor || "AdhiraMart"}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Category</span>
                  <span className="font-semibold text-primary text-xs capitalize">{product.productType || "Curated"}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Availability</span>
                  <span className="font-semibold text-emerald-600 text-xs">
                    {isAvailable ? "Ready to Dispatch" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h4 className="font-bold text-base text-primary">All Reviews (451)</h4>
                <button
                  type="button"
                  className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Cards (Reference 1 style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-white space-y-2">
                  <div className="flex text-amber-400 text-sm">{"★".repeat(5)}</div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
                    <span>Samantha D.</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    &quot;I absolutely love this product! The material is premium, comfortable, and the fit is perfect. Exactly as described!&quot;
                  </p>
                  <p className="text-[10px] text-muted pt-1">Posted on October 14, 2026</p>
                </div>

                <div className="p-5 rounded-2xl border border-border bg-white space-y-2">
                  <div className="flex text-amber-400 text-sm">{"★".repeat(5)}</div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-primary">
                    <span>Alex M.</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    &quot;The craftsmanship and aesthetic exceeded my expectations. Fast delivery and high-end packaging as well!&quot;
                  </p>
                  <p className="text-[10px] text-muted pt-1">Posted on October 12, 2026</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="space-y-3">
              <details className="p-4 rounded-xl border border-border bg-[#FAF9F7] group">
                <summary className="font-bold text-xs sm:text-sm text-primary cursor-pointer list-none flex justify-between items-center">
                  <span>How do I care for and clean this product?</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Machine wash cold with similar colors. Gentle cycle recommended. Tumble dry low or air dry to preserve fabric longevity.
                </p>
              </details>

              <details className="p-4 rounded-xl border border-border bg-[#FAF9F7] group">
                <summary className="font-bold text-xs sm:text-sm text-primary cursor-pointer list-none flex justify-between items-center">
                  <span>What is your return and exchange policy?</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  We offer a 7-day hassle-free return and exchange policy on all unworn items with original tags intact.
                </p>
              </details>

              <details className="p-4 rounded-xl border border-border bg-[#FAF9F7] group">
                <summary className="font-bold text-xs sm:text-sm text-primary cursor-pointer list-none flex justify-between items-center">
                  <span>How long does delivery take?</span>
                  <span className="text-muted group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
                  Orders are dispatched within 24 hours. Standard shipping takes 3–5 business days, with live tracking provided via SMS and email.
                </p>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
