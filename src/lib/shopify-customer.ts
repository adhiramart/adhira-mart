import crypto from "crypto";
import { cookies } from "next/headers";

export interface ShopifyAuthConfig {
  shopDomain: string;
  shopId: string;
  clientId: string;
  appUrl: string;
}

export function getShopifyAuthConfig(): ShopifyAuthConfig {
  const shopDomain = process.env.SHOPIFY_STORE_DOMAIN || "x1v4u2-ai.myshopify.com";
  const shopId = process.env.SHOPIFY_SHOP_ID || "68068278406";
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return { shopDomain, shopId, clientId, appUrl };
}

export function getAppBaseUrl(requestHost?: string | null, requestProto?: string | null): string {
  const { appUrl } = getShopifyAuthConfig();
  if (appUrl && !appUrl.includes("localhost")) {
    return appUrl.replace(/\/$/, "");
  }

  if (requestHost) {
    const isLocal = requestHost.includes("localhost") || requestHost.includes("127.0.0.1");
    const proto = isLocal ? "http" : (requestProto || "https");
    return `${proto}://${requestHost}`;
  }

  return appUrl.replace(/\/$/, "");
}

export function getRedirectUri(requestHost?: string | null, requestProto?: string | null): string {
  const baseUrl = getAppBaseUrl(requestHost, requestProto);
  return `${baseUrl}/api/auth/callback`;
}

// ---------------- PKCE Helpers ---------------- //

export function generateRandomString(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ---------------- OAuth Helpers ---------------- //

export function buildAuthorizationUrl({
  state,
  nonce,
  codeChallenge,
  redirectUri,
}: {
  state: string;
  nonce: string;
  codeChallenge: string;
  redirectUri: string;
}): string {
  const { shopId, clientId } = getShopifyAuthConfig();

  if (!clientId) {
    throw new Error(
      "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID is missing. Please configure it in your .env file."
    );
  }

  const authUrl = new URL(
    `https://shopify.com/authentication/${shopId}/oauth/authorize`
  );

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid email customer-account-api:full");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return authUrl.toString();
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type?: string;
  error?: string;
  error_description?: string;
}

export async function exchangeCodeForTokens({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const { shopId, clientId } = getShopifyAuthConfig();

  const tokenUrl = `https://shopify.com/authentication/${shopId}/oauth/token`;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Shopify OAuth Token Exchange Failed:", response.status, errorText);
    throw new Error(`Failed to exchange authorization code for tokens: ${errorText}`);
  }

  return response.json();
}

export async function refreshCustomerToken(refreshToken: string): Promise<TokenResponse> {
  const { shopId, clientId } = getShopifyAuthConfig();

  const tokenUrl = `https://shopify.com/authentication/${shopId}/oauth/token`;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Shopify OAuth Token Refresh Failed:", response.status, errorText);
    throw new Error(`Failed to refresh customer token: ${errorText}`);
  }

  return response.json();
}

// ---------------- Customer Account API Fetcher ---------------- //

export async function fetchCustomerAccountApi<T>({
  query,
  variables = {},
  accessToken,
}: {
  query: string;
  variables?: Record<string, unknown>;
  accessToken: string;
}): Promise<T> {
  const { shopId } = getShopifyAuthConfig();
  const endpoint = `https://shopify.com/${shopId}/account/customer/api/2026-10/graphql`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Customer Account API HTTP Error:", response.status, errorText);
    throw new Error(`Customer Account API HTTP Error: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error("Customer Account GraphQL Errors:", result.errors);
    throw new Error(result.errors[0]?.message || "GraphQL execution error in Customer Account API");
  }

  return result.data;
}

// ---------------- Session / Cookie Management ---------------- //

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("shopify_customer_access_token")?.value;
  const refreshToken = cookieStore.get("shopify_customer_refresh_token")?.value;
  const idToken = cookieStore.get("shopify_customer_id_token")?.value;

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    idToken,
  };
}

// ---------------- GraphQL Queries ---------------- //

export const CUSTOMER_DETAILS_QUERY = `
  query CustomerDetails {
    customer {
      id
      firstName
      lastName
      displayName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        address1
        address2
        city
        zoneCode
        zip
        firstName
        lastName
        phoneNumber
      }
      addresses(first: 5) {
        nodes {
          id
          address1
          address2
          city
          zoneCode
          zip
          phoneNumber
        }
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 5) {
            nodes {
              id
              title
              quantity
              totalPrice {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;
