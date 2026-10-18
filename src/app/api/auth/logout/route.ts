import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppBaseUrl } from "@/lib/shopify-customer";

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

async function handleLogout(request: NextRequest) {
  const cookieStore = await cookies();

  // Clear all customer tokens
  cookieStore.delete("shopify_customer_access_token");
  cookieStore.delete("shopify_customer_refresh_token");
  cookieStore.delete("shopify_customer_id_token");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = getAppBaseUrl(host, protocol);

  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get("return_to") || "/";

  // Directly redirect back to your custom storefront
  return NextResponse.redirect(new URL(returnTo, baseUrl));
}
