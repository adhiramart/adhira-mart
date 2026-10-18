import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getAppBaseUrl, getRedirectUri } from "@/lib/shopify-customer";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Determine dynamic base URL and redirect_uri
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = getAppBaseUrl(host, protocol);
  const redirectUri = getRedirectUri(host, protocol);

  const cookieStore = await cookies();
  const savedState = cookieStore.get("shopify_auth_state")?.value;
  const codeVerifier = cookieStore.get("shopify_auth_verifier")?.value;
  const returnTo = cookieStore.get("shopify_auth_return_to")?.value || "/account";

  // Clean up temporary auth cookies
  cookieStore.delete("shopify_auth_state");
  cookieStore.delete("shopify_auth_verifier");
  cookieStore.delete("shopify_auth_return_to");

  // Handle OAuth provider error or customer cancellation
  if (error) {
    console.error("Shopify OAuth Error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent(errorDescription || error)}`, baseUrl)
    );
  }

  // Validate state and verifier
  if (!code || !codeVerifier || !state || state !== savedState) {
    console.error("OAuth state/verifier mismatch or missing code", {
      hasCode: !!code,
      hasVerifier: !!codeVerifier,
      stateMatch: state === savedState,
    });
    return NextResponse.redirect(
      new URL("/account/login?error=invalid_state_or_verifier", baseUrl)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      redirectUri,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const isSecure = isProduction || protocol === "https";

    // Set Customer Access Token cookie
    cookieStore.set("shopify_customer_access_token", tokens.access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.expires_in || 7200, // typically 2 hours
    });

    // Set Customer Refresh Token cookie if provided
    if (tokens.refresh_token) {
      cookieStore.set("shopify_customer_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Set ID Token cookie if provided
    if (tokens.id_token) {
      cookieStore.set("shopify_customer_id_token", tokens.id_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.redirect(new URL(returnTo, baseUrl));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication exchange failed";
    console.error("Authentication Error in callback:", err);
    return NextResponse.redirect(
      new URL(`/account/login?error=${encodeURIComponent(msg)}`, baseUrl)
    );
  }
}
