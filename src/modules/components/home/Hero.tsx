"use client";

import React from "react";
import Link from "next/link";

const categories = [
  {
    name: "Women",
    description: "Fashion, Accessories & More",
    image: "/assets/home/women.jpg",
    href: "/collections/women",
  },
  {
    name: "Kids",
    description: "Toys, Fashion & Essentials",
    image: "/assets/home/kids.jpg",
    href: "/collections/kids",
  },
  {
    name: "Home Decor",
    description: "Decorate Your Happy Space",
    image: "/assets/home/home-decor.jpg",
    href: "/collections/home-decor",
  },
];

const stats = [
  { value: "200+", label: "International Brands" },
  { value: "2,000+", label: "Premium Products" },
  { value: "30,000+", label: "Happy Customers" },
];

export default function Hero() {
  return (
    <section className="relative w-full bg-ivory text-primary overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
        {/* Main Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] xl:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-8 xl:gap-14">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="relative z-10 max-w-2xl">
            {/* Eyebrow */}
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-neutral-500">
              YOUR STYLE · THEIR JOY · A BETTER HOME
            </p>

            {/* Massive Editorial Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[86px] font-black uppercase leading-[0.92] tracking-[-0.055em] text-primary select-none">
              EVERYDAY
              <br />
              BEAUTY FOR
              <br />
              EVERY STORY
            </h1>

            {/* Subtitle Description */}
            <p className="mt-6 sm:mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-[#7A746E]">
              Discover thoughtfully curated products for women, kids and home
              d&eacute;cor &mdash; bringing style, comfort and joy to every part
              of your life.
            </p>

            {/* Shop Now CTA */}
            <div className="mt-8 sm:mt-10">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-3.5 rounded-full bg-primary px-8 sm:px-10 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 shadow-md hover:shadow-lg active:scale-98 group"
              >
                <span>Shop Now</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </Link>
            </div>

            {/* Highlights Stats */}
            <div className="mt-10 sm:mt-12 grid max-w-xl grid-cols-3 pt-4 sm:pt-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`pr-3 sm:pr-4 ${index !== 0
                      ? "border-l border-neutral-300/80 pl-4 sm:pl-6"
                      : ""
                    }`}
                >
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm leading-5 text-neutral-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Lifestyle Imagery */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Sparkle Accent Left */}
            <span
              aria-hidden="true"
              className="absolute -left-4 sm:left-4 top-1/3 text-3xl sm:text-4xl text-primary select-none pointer-events-none hidden sm:block animate-pulse"
            >
              &#10022;
            </span>

            {/* Sparkle Accent Bottom Right */}
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-12 text-3xl sm:text-4xl text-primary select-none pointer-events-none hidden sm:block"
            >
              &#10022;
            </span>

            {/* Main Lifestyle Image Container */}
            <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#E8E2DC] group">
              <img
                src="/assets/home/hero-lifestyle.jpg"
                alt="Mother and daughter enjoying lifestyle moments at home"
                className="w-full h-[400px] sm:h-[500px] lg:h-[560px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Floating Category Cards Row */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group flex items-center gap-4 sm:gap-5 p-3.5 sm:p-4 rounded-3xl bg-white/75 hover:bg-white backdrop-blur-md border border-black/5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 transition-transform duration-500 group-hover:scale-105"
                />

                <div className="min-w-0 flex-1 py-1">
                  <h3 className="text-lg sm:text-xl font-bold text-primary group-hover:text-black">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500 line-clamp-1">
                    {category.description}
                  </p>
                </div>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-warm-grey group-hover:bg-primary text-primary group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0">
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
