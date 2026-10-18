"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ShopifyProduct } from "@/lib/products";

interface ProductCarouselSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  products: ShopifyProduct[];
  viewAllHref: string;
}

export default function ProductCarouselSection({
  id,
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductCarouselSectionProps) {
  // If fewer than 8 items, duplicate items to allow seamless infinite loop across 4 desktop columns
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length >= 8) return products;
    // Repeat products to ensure smooth looping in Embla
    const repeated: ShopifyProduct[] = [];
    while (repeated.length < 8) {
      repeated.push(...products);
    }
    return repeated;
  }, [products]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: displayProducts.length > 3,
      align: "start",
      slidesToScroll: 1,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!products || products.length === 0) {
    return (
      <section
        id={id}
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-16 scroll-mt-24 md:scroll-mt-28"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {subtitle && (
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold mb-2">
                {subtitle}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="p-8 bg-ivory border border-black/5 rounded-3xl text-center text-neutral-600">
          No products found in this collection yet. Add products to &quot;{title}&quot; in Shopify.
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-16 sm:py-20 scroll-mt-24 md:scroll-mt-28"
    >
      {/* Header with Title, Controls, and View All */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-semibold mb-2">
              {subtitle}
            </p>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-primary">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!emblaApi}
              className="w-11 h-11 rounded-full border border-black/10 bg-white flex items-center justify-center text-primary hover:bg-neutral-50 hover:border-black/25 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-40"
              aria-label="Previous products"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={scrollNext}
              disabled={!emblaApi}
              className="w-11 h-11 rounded-full border border-black/10 bg-white flex items-center justify-center text-primary hover:bg-neutral-50 hover:border-black/25 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-40"
              aria-label="Next products"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View All Button */}
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-95"
          >
            View All &rarr;
          </Link>
        </div>
      </div>

      {/* Embla Carousel Viewport */}
      <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6" ref={emblaRef}>
        <div className="flex -ml-4 sm:-ml-6">
          {displayProducts.map((product, idx) => {
            const numericId = product.id.split("/").pop() || product.handle;
            const primaryImage = product.featuredImage;
            const minPrice = product.priceRange.minVariantPrice;

            return (
              <div
                key={`${product.id}-${idx}`}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-4 sm:pl-6"
              >
                <Link
                  href={`/product/${numericId}`}
                  className="group p-4 bg-white rounded-3xl border border-black/5 hover:border-black/20 transition-all duration-300 hover:shadow-xl flex flex-col h-full block"
                >
                  {/* Product Image */}
                  <div className="w-full h-72 sm:h-80 overflow-hidden rounded-2xl bg-ivory mb-4 relative flex items-center justify-center">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.altText || product.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm font-medium">No image available</div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-primary mb-1 line-clamp-1 group-hover:text-black">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-500 mb-4 line-clamp-2 leading-relaxed">
                    {product.description || "Thoughtfully designed for comfort and everyday elegance."}
                  </p>

                  {/* Price & Action */}
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-100">
                    <p className="text-lg font-black text-primary">
                      {minPrice.currencyCode === "INR" ? "₹" : minPrice.currencyCode}{" "}
                      {parseFloat(minPrice.amount).toFixed(2)}
                    </p>
                    <span className="text-xs font-semibold text-primary underline underline-offset-4 group-hover:text-neutral-600 transition-colors">
                      View Details &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
