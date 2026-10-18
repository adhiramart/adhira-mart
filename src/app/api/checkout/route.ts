import { NextRequest, NextResponse } from "next/server";
import {
  createInstantCheckoutCart,
  getShopifyCart,
  updateShopifyCartBuyerIdentity,
} from "@/lib/cart";
import {
  CUSTOMER_DETAILS_QUERY,
  fetchCustomerAccountApi,
  getCustomerSession,
} from "@/lib/shopify-customer";

export async function POST(request: NextRequest) {
  return handleCheckout(request);
}

export async function GET(request: NextRequest) {
  return handleCheckout(request);
}

async function handleCheckout(request: NextRequest) {
  try {
    let cartId: string | undefined;
    let variantId: string | undefined;
    let quantity: number = 1;

    if (request.method === "POST") {
      try {
        const body = await request.json();
        cartId = body.cartId;
        variantId = body.variantId;
        if (typeof body.quantity === "number" && body.quantity > 0) {
          quantity = body.quantity;
        }
      } catch {
        // Fallback to query params if JSON body is empty
      }
    }

    if (!cartId && !variantId) {
      const searchParams = request.nextUrl.searchParams;
      cartId = searchParams.get("cartId") || undefined;
      variantId = searchParams.get("variantId") || undefined;
      const q = searchParams.get("quantity");
      if (q) quantity = parseInt(q, 10) || 1;
    }

    // Attempt to retrieve logged-in customer's email to pre-fill checkout
    let customerEmail: string | undefined;
    const session = await getCustomerSession();

    if (session?.accessToken) {
      try {
        const customerData = await fetchCustomerAccountApi<{
          customer: {
            emailAddress?: { emailAddress?: string | null } | null;
          };
        }>({
          query: `query { customer { emailAddress { emailAddress } } }`,
          accessToken: session.accessToken,
        });

        customerEmail = customerData.customer?.emailAddress?.emailAddress || undefined;
      } catch (err) {
        console.warn("Could not fetch customer email for checkout attachment:", err);
      }
    }

    let checkoutUrl: string | undefined;

    // Case 1: Instant Checkout (Buy Now)
    if (variantId) {
      const cart = await createInstantCheckoutCart(variantId, quantity, customerEmail);
      checkoutUrl = cart.checkoutUrl;
    }
    // Case 2: Regular Cart Checkout
    else if (cartId) {
      let cart = await getShopifyCart(cartId);

      if (!cart) {
        return NextResponse.json({ error: "Cart not found or expired" }, { status: 404 });
      }

      // Attach buyer email if available and not yet set
      if (customerEmail) {
        try {
          cart = await updateShopifyCartBuyerIdentity(cartId, { email: customerEmail });
        } catch (identityErr) {
          console.warn("Buyer identity attachment warning:", identityErr);
        }
      }

      checkoutUrl = cart.checkoutUrl;
    } else {
      return NextResponse.json(
        { error: "Missing required parameter: cartId or variantId" },
        { status: 400 }
      );
    }

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Could not generate Shopify checkout URL" },
        { status: 500 }
      );
    }

    // If request asks for redirect (e.g. from direct form submit or GET request), redirect
    if (request.method === "GET" || request.headers.get("accept")?.includes("text/html")) {
      return NextResponse.redirect(checkoutUrl);
    }

    return NextResponse.json({ checkoutUrl });
  } catch (error: unknown) {
    console.error("Checkout route error:", error);
    const message = error instanceof Error ? error.message : "Failed to initiate checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
