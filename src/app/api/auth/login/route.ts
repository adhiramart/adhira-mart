import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateRandomString,
  getAppBaseUrl,
  getRedirectUri,
  getShopifyAuthConfig,
} from "@/lib/shopify-customer";

export async function GET(request: NextRequest) {
  const { clientId, appUrl } = getShopifyAuthConfig();
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get("return_to") || "/account";

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  // If request initiated from localhost, but appUrl is an ngrok tunnel (or other HTTPS domain),
  // redirect to the tunnel so PKCE cookies are stored on the exact domain that receives the OAuth callback.
  if (host.includes("localhost") && appUrl && !appUrl.includes("localhost")) {
    const tunnelLoginUrl = new URL("/api/auth/login", appUrl);
    tunnelLoginUrl.searchParams.set("return_to", returnTo);
    return NextResponse.redirect(tunnelLoginUrl);
  }

  if (!clientId) {
    const baseUrl = getAppBaseUrl(host, protocol);
    return NextResponse.redirect(
      new URL("/account/login?error=missing_client_id", baseUrl)
    );
  }

  const redirectUri = getRedirectUri(host, protocol);

  // Generate PKCE parameters
  const codeVerifier = generateRandomString(32);
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);
  const nonce = generateRandomString(16);

  const authUrl = buildAuthorizationUrl({
    state,
    nonce,
    codeChallenge,
    redirectUri,
  });

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = isProduction || protocol === "https";

  // Store PKCE verifier, state, and returnTo in short-lived secure cookies
  cookieStore.set("shopify_auth_verifier", codeVerifier, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  cookieStore.set("shopify_auth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  cookieStore.set("shopify_auth_return_to", returnTo, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(authUrl);
}
