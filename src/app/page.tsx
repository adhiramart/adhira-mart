import Hero from "../modules/components/home/Hero";
import ProductCarouselSection from "../modules/components/home/ProductCarouselSection";
import { getProductsByCollection } from "../lib/products";

export default async function HomePage() {
  const [newArrivals, recommended] = await Promise.all([
    getProductsByCollection("new-arrivals").catch(() => []),
    getProductsByCollection("recommended-products").catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* New Arrivals Section */}
      <ProductCarouselSection
        id="new-arrivals"
        title="New Arrivals"
        subtitle="Fresh In Store"
        products={newArrivals}
        viewAllHref="/collections/new-arrivals"
      />

      {/* Recommended Products Section */}
      <ProductCarouselSection
        id="recommended-products"
        title="Recommended Products"
        subtitle="Curated Best Sellers"
        products={recommended}
        viewAllHref="/collections/recommended-products"
      />
    </div>
  );
}
