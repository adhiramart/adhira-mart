import { shopifyFetch } from "./shopify";

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage?: {
    url: string;
    altText: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface ProductsResponse {
  products: {
    nodes: ShopifyProduct[];
  };
}

interface CollectionResponse {
  collection: {
    title: string;
    products: {
      edges: Array<{ node: ShopifyProduct }>;
    };
  } | null;
}

export async function getProducts(): Promise<ShopifyProduct[]> {
  const query = `
    query GetProducts {
      products(first: 10) {
        nodes {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<ProductsResponse>({ query });
  return data.products.nodes;
}

async function fetchRawCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const query = `
    query getCollectionByHandle($handle: String!) {
      collection(handle: $handle) {
        title
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<CollectionResponse>({
      query,
      variables: { handle },
    });

    if (!data.collection) return [];
    return data.collection.products.edges.map((edge) => edge.node);
  } catch (error) {
    console.error(`Error fetching collection ${handle}:`, error);
    return [];
  }
}

export async function getProductsByCollection(handle: string): Promise<ShopifyProduct[]> {
  const primary = await fetchRawCollectionProducts(handle);

  // If handle is new-arrivals, check if duplicate handle new-arrivals-1 has more products
  if (handle === "new-arrivals") {
    const secondary = await fetchRawCollectionProducts("new-arrivals-1");
    if (secondary.length > primary.length) {
      return secondary;
    }
  }

  return primary;
}

export interface ShopifyProductImage {
  id: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: ShopifyProductImage | null;
}

export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ShopifyProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  vendor?: string;
  productType?: string;
  tags?: string[];
  images: {
    nodes: ShopifyProductImage[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice?: {
      amount: string;
      currencyCode: string;
    };
  };
  options: ShopifyProductOption[];
  variants: {
    nodes: ShopifyProductVariant[];
  };
}

const PRODUCT_DETAIL_FRAGMENT = `
  id
  title
  handle
  description
  descriptionHtml
  availableForSale
  vendor
  productType
  tags
  images(first: 20) {
    nodes {
      id
      url
      altText
      width
      height
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  options {
    id
    name
    values
  }
  variants(first: 50) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      image {
        id
        url
        altText
        width
        height
      }
    }
  }
`;

interface SingleProductResponse {
  product: ShopifyProductDetail | null;
}

export async function getProductById(id: string): Promise<ShopifyProductDetail | null> {
  const gid = id.startsWith("gid://shopify/Product/")
    ? id
    : `gid://shopify/Product/${id}`;

  const query = `
    query getProductById($id: ID!) {
      product(id: $id) {
        ${PRODUCT_DETAIL_FRAGMENT}
      }
    }
  `;

  try {
    const data = await shopifyFetch<SingleProductResponse>({
      query,
      variables: { id: gid },
    });
    return data.product;
  } catch (error) {
    console.error(`Error fetching product by ID ${id}:`, error);
    return null;
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProductDetail | null> {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        ${PRODUCT_DETAIL_FRAGMENT}
      }
    }
  `;

  try {
    const data = await shopifyFetch<SingleProductResponse>({
      query,
      variables: { handle },
    });
    return data.product;
  } catch (error) {
    console.error(`Error fetching product by handle ${handle}:`, error);
    return null;
  }
}

/**
 * Universal product resolver: accepts numeric ID, Shopify GID, or handle.
 * Tries by ID first if identifier is numeric or GID; otherwise tries by handle.
 * Falls back if initial lookup does not yield a product.
 */
export async function getProduct(identifier: string): Promise<ShopifyProductDetail | null> {
  if (!identifier) return null;

  const isGid = identifier.startsWith("gid://shopify/Product/");
  const isNumeric = /^\d+$/.test(identifier);

  if (isGid || isNumeric) {
    const product = await getProductById(identifier);
    if (product) return product;
    // Fall back to handle just in case a handle happens to be numeric
    return await getProductByHandle(identifier);
  } else {
    const product = await getProductByHandle(identifier);
    if (product) return product;
    // Fall back to ID
    return await getProductById(identifier);
  }
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
}

interface CollectionsResponse {
  collections: {
    nodes: ShopifyCollection[];
  };
}

/**
 * Fetch all Shopify collections, excluding "New Arrivals", "Best Sellers", "Recommended", and "Home page"
 * so that only category collections (Clothing, Home Decor, Baby, etc.) are shown in the Shop dropdown.
 */
export async function getShopifyCollections(): Promise<ShopifyCollection[]> {
  const query = `
    query GetCollections {
      collections(first: 50) {
        nodes {
          id
          title
          handle
          description
          image {
            url
            altText
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<CollectionsResponse>({ query });
    const excludedTerms = [
      "new arrival",
      "new arrivals",
      "best seller",
      "best sellers",
      "recommended",
      "recommended products",
      "home page",
      "frontpage",
    ];

    const filtered = (data?.collections?.nodes || []).filter((col) => {
      const titleLower = col.title.trim().toLowerCase();
      const handleLower = col.handle.trim().toLowerCase();

      return !excludedTerms.some(
        (term) => titleLower.includes(term) || handleLower.includes(term)
      );
    });

    return filtered;
  } catch (error) {
    console.error("Failed to fetch Shopify collections:", error);
    return [];
  }
}
