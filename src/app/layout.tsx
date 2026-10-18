import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../modules/components/common/Navbar";
import Footer from "../modules/components/common/Footer";
import { CartProvider } from "@/modules/context/CartContext";
import CartDrawer from "@/modules/components/cart/CartDrawer";
import { getShopifyCollections } from "@/lib/products";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adhira Mart",
  description: "Find clothes that match your style at Adhira Mart",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const collections = await getShopifyCollections().catch(() => []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-primary">
        <CartProvider>
          <Navbar initialCollections={collections} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}


