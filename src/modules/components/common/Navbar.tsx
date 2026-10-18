"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/modules/context/CartContext";
import type { ShopifyCollection } from "@/lib/products";

interface NavbarProps {
  initialCollections?: ShopifyCollection[];
}

export default function Navbar({ initialCollections = [] }: NavbarProps) {
  const router = useRouter();
  const { cart, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [collections, setCollections] = useState<ShopifyCollection[]>(initialCollections);
  const [isLoadingCollections, setIsLoadingCollections] = useState(initialCollections.length === 0);
  const shopDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic category collections from API if not pre-provided
  useEffect(() => {
    if (initialCollections.length > 0) {
      setCollections(initialCollections);
      setIsLoadingCollections(false);
      return;
    }

    let isMounted = true;
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data.collections)) {
          setCollections(data.collections);
        }
      })
      .catch((err) => {
        console.error("Error fetching navbar collections:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCollections(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCollections]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsShopDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  // Scroll to section on home page or navigate there if on another page
  const handleScrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border/80">
      <nav
        role="navigation"
        aria-label="Main Navigation"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 h-20 md:h-24 flex items-center justify-between gap-6 xl:gap-10"
      >
        {/* Left Section: Mobile Toggle & Adhira Mart Logo */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 -ml-1.5 rounded-lg text-primary hover:bg-secondary focus:outline-none lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>

          {/* Logo Adhira Mart */}
          <Link
            href="/"
            className="text-[28px] sm:text-[32px] font-black tracking-[-0.04em] text-primary select-none leading-none hover:opacity-90 transition-opacity"
          >
            Adhira Mart
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-base shrink-0">
          {/* Shop Dropdown */}
          <div className="relative" ref={shopDropdownRef}>
            <button
              type="button"
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              className="flex items-center gap-1 py-2 text-primary hover:text-muted font-normal cursor-pointer transition-colors"
              aria-haspopup="true"
              aria-expanded={isShopDropdownOpen}
            >
              <span>Shop</span>
              <svg
                className={`w-4 h-4 text-primary transition-transform duration-200 ${isShopDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Shop Dropdown Popover */}
            {isShopDropdownOpen && (
              <div
                onMouseLeave={() => setIsShopDropdownOpen(false)}
                className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-border p-3 grid gap-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto"
              >
                {isLoadingCollections ? (
                  <div className="py-6 text-center text-xs text-muted">
                    Loading collections...
                  </div>
                ) : collections.length === 0 ? (
                  <div className="py-4 px-3 text-center text-xs text-muted">
                    No collections found.
                  </div>
                ) : (
                  collections.map((cat) => (
                    <Link
                      key={cat.id || cat.handle}
                      href={`/collections/${cat.handle}`}
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="group/item flex flex-col p-2.5 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <span className="text-sm font-semibold text-primary capitalize group-hover/item:text-black">
                        {cat.title}
                      </span>
                      <span className="text-xs text-muted line-clamp-1">
                        {cat.description || "Explore collection"}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleScrollToSection("recommended-products")}
            className="text-primary hover:text-muted font-normal transition-colors py-2 cursor-pointer"
          >
            Recommended Products
          </button>

          <button
            type="button"
            onClick={() => handleScrollToSection("new-arrivals")}
            className="text-primary hover:text-muted font-normal transition-colors py-2 cursor-pointer"
          >
            New Arrivals
          </button>
        </div>

        {/* Center: Search Bar (Pill Shape with Light Gray Background) */}
        <div className="hidden md:flex flex-1 items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full h-12 bg-secondary rounded-full flex items-center px-4 md:px-5 gap-3 transition-all focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-secondary/90 hover:bg-secondary/90"
          >
            {/* Search Magnifying Glass Icon */}
            <svg
              className="w-5 h-5 text-muted-light shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full bg-transparent text-primary placeholder:text-muted-light text-sm md:text-base outline-none border-none focus:outline-none"
            />

            {/* Clear Input Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-light hover:text-primary p-1 shrink-0"
                aria-label="Clear search query"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Right Section: Mobile Search Toggle, Cart & User Account Icons */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5 shrink-0">
          {/* Mobile Search Icon Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-1.5 rounded-full text-primary hover:bg-secondary transition-colors md:hidden"
            aria-label="Search"
          >
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Cart Icon */}
          <Link
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              openCart();
            }}
            className="p-1.5 rounded-full text-primary hover:opacity-75 transition-opacity relative flex items-center justify-center group"
            aria-label="Cart"
          >
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
            >
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.5 3.5h2.8l2.6 11.2a1.5 1.5 0 001.46 1.16h8.74a1.5 1.5 0 001.46-1.16l1.8-8.2H6.2"
              />
            </svg>
            {cart && cart.totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-in zoom-in">
                {cart.totalQuantity}
              </span>
            )}
          </Link>

          {/* User Profile / Account Icon */}
          <Link
            href="/account"
            className="p-1.5 rounded-full text-primary hover:opacity-75 transition-opacity flex items-center justify-center group"
            aria-label="User Account"
          >
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
            >
              <circle cx="12" cy="12" r="9.5" />
              <circle cx="12" cy="9" r="3.2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.6 18.1a6.6 6.6 0 0110.8 0"
              />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-border bg-white animate-in slide-in-from-top duration-200">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full h-11 bg-secondary rounded-full flex items-center px-4 gap-3"
          >
            <svg
              className="w-5 h-5 text-muted-light shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full bg-transparent text-primary placeholder:text-muted-light text-sm outline-none border-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-light hover:text-primary p-1"
                aria-label="Clear search query"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col gap-6 overflow-y-auto border-r border-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Menu
              </span>

              {/* Mobile Shop Accordion */}
              <div className="py-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                  className="w-full flex items-center justify-between text-lg font-medium text-primary py-2"
                >
                  <span>Shop</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${isShopDropdownOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isShopDropdownOpen && (
                  <div className="pl-3 py-2 flex flex-col gap-2 border-l-2 border-secondary ml-1 max-h-60 overflow-y-auto">
                    {isLoadingCollections ? (
                      <span className="text-xs text-muted py-1">Loading...</span>
                    ) : collections.length === 0 ? (
                      <span className="text-xs text-muted py-1">No collections</span>
                    ) : (
                      collections.map((cat) => (
                        <Link
                          key={cat.id || cat.handle}
                          href={`/collections/${cat.handle}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-sm font-medium text-muted hover:text-primary py-1.5 capitalize transition-colors"
                        >
                          {cat.title}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleScrollToSection("recommended-products")}
                className="text-left text-lg font-medium text-primary py-3 border-b border-border hover:text-muted transition-colors cursor-pointer"
              >
                Recommended Products
              </button>

              <button
                type="button"
                onClick={() => handleScrollToSection("new-arrivals")}
                className="text-left text-lg font-medium text-primary py-3 border-b border-border hover:text-muted transition-colors cursor-pointer"
              >
                New Arrivals
              </button>
            </div>

            {/* Quick Links in Mobile Drawer */}
            <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  openCart();
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary text-primary font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                  >
                    <circle cx="9" cy="20" r="1.5" />
                    <circle cx="18" cy="20" r="1.5" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.5 3.5h2.8l2.6 11.2a1.5 1.5 0 001.46 1.16h8.74a1.5 1.5 0 001.46-1.16l1.8-8.2H6.2"
                    />
                  </svg>
                  <span>Shopping Cart</span>
                </div>
                {cart && cart.totalQuantity > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.totalQuantity}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-secondary text-primary font-medium text-sm"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9.5" />
                  <circle cx="12" cy="9" r="3.2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.6 18.1a6.6 6.6 0 0110.8 0"
                  />
                </svg>
                <span>My Account</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
