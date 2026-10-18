import { shopifyFetch } from "./shopify";

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  merchandise: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      title: string;
      handle: string;
    };
    image?: {
      url: string;
      altText: string | null;
    } | null;
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    nodes: ShopifyCartLine[];
  };
}

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          price {
            amount
            currencyCode
          }
          product {
            title
            handle
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: Array<{ code?: string; field?: string[]; message: string }>;
  };
}

interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart | null;
    userErrors: Array<{ code?: string; field?: string[]; message: string }>;
  };
}

interface CartLinesUpdateResponse {
  cartLinesUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{ code?: string; field?: string[]; message: string }>;
  };
}

interface CartLinesRemoveResponse {
  cartLinesRemove: {
    cart: ShopifyCart | null;
    userErrors: Array<{ code?: string; field?: string[]; message: string }>;
  };
}

interface CartGetResponse {
  cart: ShopifyCart | null;
}

export async function createShopifyCart(variantId: string, quantity = 1): Promise<ShopifyCart> {
  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<CartCreateResponse>({
    query,
    variables: {
      input: {
        lines: [{ merchandiseId: variantId, quantity }],
      },
    },
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
  }

  if (!data.cartCreate.cart) {
    throw new Error("Failed to create cart");
  }

  return data.cartCreate.cart;
}

export async function addToShopifyCart(
  cartId: string,
  variantId: string,
  quantity = 1
): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<CartLinesAddResponse>({
    query,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join(", "));
  }

  if (!data.cartLinesAdd.cart) {
    throw new Error("Failed to add item to cart");
  }

  return data.cartLinesAdd.cart;
}

export async function getShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    query getCart($id: ID!) {
      cart(id: $id) {
        ${CART_FRAGMENT}
      }
    }
  `;

  try {
    const data = await shopifyFetch<CartGetResponse>({
      query,
      variables: { id: cartId },
    });
    return data.cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function updateShopifyCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<CartLinesUpdateResponse>({
    query,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join(", "));
  }

  if (!data.cartLinesUpdate.cart) {
    throw new Error("Failed to update cart line");
  }

  return data.cartLinesUpdate.cart;
}

export async function removeShopifyCartLine(cartId: string, lineId: string): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<CartLinesRemoveResponse>({
    query,
    variables: {
      cartId,
      lineIds: [lineId],
    },
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join(", "));
  }

  if (!data.cartLinesRemove.cart) {
    throw new Error("Failed to remove item from cart");
  }

  return data.cartLinesRemove.cart;
}

interface CartBuyerIdentityUpdateResponse {
  cartBuyerIdentityUpdate: {
    cart: ShopifyCart | null;
    userErrors: Array<{ code?: string; field?: string[]; message: string }>;
  };
}

export async function updateShopifyCartBuyerIdentity(
  cartId: string,
  buyerIdentity: {
    email?: string;
    phone?: string;
    countryCode?: string;
  }
): Promise<ShopifyCart> {
  const query = `
    mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
      cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<CartBuyerIdentityUpdateResponse>({
    query,
    variables: {
      cartId,
      buyerIdentity,
    },
  });

  if (data.cartBuyerIdentityUpdate.userErrors.length > 0) {
    console.warn("Buyer identity update warning:", data.cartBuyerIdentityUpdate.userErrors);
  }

  if (!data.cartBuyerIdentityUpdate.cart) {
    throw new Error("Failed to update cart buyer identity");
  }

  return data.cartBuyerIdentityUpdate.cart;
}

export async function createInstantCheckoutCart(
  variantId: string,
  quantity = 1,
  buyerEmail?: string
): Promise<ShopifyCart> {
  const query = `
    mutation cartCreate($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const input: {
    lines: Array<{ merchandiseId: string; quantity: number }>;
    buyerIdentity?: { email: string };
  } = {
    lines: [{ merchandiseId: variantId, quantity }],
  };

  if (buyerEmail) {
    input.buyerIdentity = { email: buyerEmail };
  }

  const data = await shopifyFetch<CartCreateResponse>({
    query,
    variables: { input },
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
  }

  if (!data.cartCreate.cart) {
    throw new Error("Failed to create instant checkout cart");
  }

  return data.cartCreate.cart;
}

