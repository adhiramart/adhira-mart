import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppBaseUrl, getShopifyAuthConfig } from "@/lib/shopify-customer";

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

async function handleLogout(request: NextRequest) {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("shopify_customer_id_token")?.value;
  const { shopId } = getShopifyAuthConfig();

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = getAppBaseUrl(host, protocol);

  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get("return_to") || "/";
  const postLogoutRedirectUri = new URL(returnTo, baseUrl).toString();

  // If an id_token exists, redirect to Shopify's end-session logout endpoint
  // so the session is terminated on Shopify (Shop Pay) as well.
  let redirectUrl = postLogoutRedirectUri;
  if (idToken && shopId) {
    const shopifyLogoutUrl = new URL(`https://shopify.com/authentication/${shopId}/logout`);
    shopifyLogoutUrl.searchParams.set("id_token_hint", idToken);
    shopifyLogoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
    redirectUrl = shopifyLogoutUrl.toString();
  }

  const response = NextResponse.redirect(redirectUrl);

  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = isProduction || protocol === "https";

  const clearOptions = {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
  };

  // Aggressively clear all customer authentication cookies
  response.cookies.set("shopify_customer_access_token", "", clearOptions);
  response.cookies.set("shopify_customer_refresh_token", "", clearOptions);
  response.cookies.set("shopify_customer_id_token", "", clearOptions);
  response.cookies.set("shopify_auth_verifier", "", clearOptions);
  response.cookies.set("shopify_auth_state", "", clearOptions);
  response.cookies.set("shopify_auth_return_to", "", clearOptions);

  return response;
}
