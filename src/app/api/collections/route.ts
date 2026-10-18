import { NextResponse } from "next/server";
import { getShopifyCollections } from "@/lib/products";

export async function GET() {
  try {
    const collections = await getShopifyCollections();
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("API error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections", collections: [] },
      { status: 500 }
    );
  }
}
