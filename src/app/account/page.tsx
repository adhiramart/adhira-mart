import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CUSTOMER_DETAILS_QUERY,
  fetchCustomerAccountApi,
  getCustomerSession,
} from "@/lib/shopify-customer";

export const metadata = {
  title: "My Account | Adhira Mart",
  description: "View your order history, profile details, and shipping addresses.",
};

interface CustomerData {
  customer: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    emailAddress?: {
      emailAddress?: string | null;
    } | null;
    phoneNumber?: {
      phoneNumber?: string | null;
    } | null;
    defaultAddress?: {
      id: string;
      address1?: string | null;
      address2?: string | null;
      city?: string | null;
      zoneCode?: string | null;
      zip?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      phoneNumber?: string | null;
    } | null;
    addresses?: {
      nodes: Array<{
        id: string;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        zoneCode?: string | null;
        zip?: string | null;
        phoneNumber?: string | null;
      }>;
    };
    orders?: {
      nodes: Array<{
        id: string;
        name: string;
        processedAt: string;
        financialStatus: string;
        fulfillmentStatus: string;
        totalPrice: {
          amount: string;
          currencyCode: string;
        };
        lineItems?: {
          nodes: Array<{
            id: string;
            title: string;
            quantity: number;
            totalPrice?: {
              amount: string;
              currencyCode: string;
            } | null;
            image?: {
              url: string;
              altText?: string | null;
            } | null;
          }>;
        };
      }>;
    };
  };
}

export default async function AccountPage() {
  const session = await getCustomerSession();

  if (!session?.accessToken) {
    redirect("/account/login");
  }

  let customerData: CustomerData | null = null;

  try {
    customerData = await fetchCustomerAccountApi<CustomerData>({
      query: CUSTOMER_DETAILS_QUERY,
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error("Account page customer fetch error:", error);
    redirect("/account/login?error=session_expired");
  }

  if (!customerData?.customer) {
    redirect("/account/login?error=unable_to_load_customer");
  }

  const { customer } = customerData;
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.displayName || "Customer";
  const email = customer.emailAddress?.emailAddress || "No email available";
  const phone = customer.phoneNumber?.phoneNumber;
  const orders = customer.orders?.nodes || [];
  const addresses = customer.addresses?.nodes || [];

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Top Header Card */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-10 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl sm:text-3xl uppercase tracking-tighter">
              {fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-taupe px-2.5 py-0.5 rounded-full bg-ivory">
                  Verified Member
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-primary mt-1">
                {fullName}
              </h1>
              <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
                {email} {phone ? `• ${phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider text-primary hover:bg-secondary transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/api/auth/logout"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Sign Out
            </Link>
          </div>
        </div>

        {/* 2-Column Grid: Orders and Account Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Order History (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary">
                Order History
              </h2>
              <span className="text-xs font-semibold text-muted bg-white border border-border px-3 py-1 rounded-full">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white border border-border/80 rounded-3xl p-10 sm:p-14 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center mx-auto mb-4 text-2xl">
                  🛍️
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight text-primary mb-1">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto mb-6 leading-relaxed">
                  When you make your first purchase at Adhira Mart, your orders, delivery status, and invoices will appear right here.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow"
                >
                  Explore Best Sellers &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const dateStr = new Date(order.processedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-black/20 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                        <div>
                          <span className="text-xs font-semibold text-muted">Order</span>
                          <h4 className="text-base font-bold text-primary">{order.name}</h4>
                          <span className="text-[11px] text-muted-light">{dateStr}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-muted">Total</span>
                          <p className="text-base font-black text-primary">
                            {order.totalPrice.currencyCode} {parseFloat(order.totalPrice.amount).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 justify-end">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {order.financialStatus}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                              {order.fulfillmentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      {order.lineItems?.nodes && order.lineItems.nodes.length > 0 && (
                        <div className="pt-4 space-y-3">
                          {order.lineItems.nodes.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3.5">
                              {item.image ? (
                                <img
                                  src={item.image.url}
                                  alt={item.image.altText || item.title}
                                  className="w-12 h-12 rounded-lg object-cover bg-ivory border border-black/5 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-ivory border border-black/5 flex items-center justify-center text-xs text-muted shrink-0">
                                  Item
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-primary truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-muted">Qty: {item.quantity}</p>
                              </div>
                              {item.totalPrice && (
                                <p className="text-xs sm:text-sm font-bold text-primary shrink-0">
                                  {item.totalPrice.currencyCode} {parseFloat(item.totalPrice.amount).toFixed(2)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side Column: Profile & Addresses */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary mb-2">
              Profile & Addresses
            </h2>

            {/* Profile Info Card */}
            <div className="bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                Personal Details
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider">Full Name</span>
                  <span className="font-semibold text-primary">{fullName}</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px] uppercase tracking-wider">Email Address</span>
                  <span className="font-semibold text-primary">{email}</span>
                </div>
                {phone && (
                  <div>
                    <span className="text-muted block text-[11px] uppercase tracking-wider">Phone Number</span>
                    <span className="font-semibold text-primary">{phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Default Address Card */}
            <div className="bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Default Shipping Address
                </h3>
                {customer.defaultAddress && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-ivory text-taupe px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>

              {customer.defaultAddress ? (
                <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-0.5">
                  <p className="font-bold text-primary">
                    {[customer.defaultAddress.firstName, customer.defaultAddress.lastName].filter(Boolean).join(" ")}
                  </p>
                  <p>{customer.defaultAddress.address1}</p>
                  {customer.defaultAddress.address2 && <p>{customer.defaultAddress.address2}</p>}
                  <p>
                    {[customer.defaultAddress.city, customer.defaultAddress.zoneCode, customer.defaultAddress.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {customer.defaultAddress.phoneNumber && (
                    <p className="text-[11px] text-muted pt-1">Tel: {customer.defaultAddress.phoneNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted leading-relaxed">
                  No default address on file. Addresses saved during checkout will be reflected here automatically.
                </p>
              )}
            </div>

            {/* Additional Addresses */}
            {addresses.filter((addr) => addr.id !== customer.defaultAddress?.id).length > 0 && (
              <div className="bg-white border border-border/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Other Saved Addresses ({addresses.filter((addr) => addr.id !== customer.defaultAddress?.id).length})
                </h3>
                <div className="space-y-3">
                  {addresses
                    .filter((addr) => addr.id !== customer.defaultAddress?.id)
                    .map((addr) => (
                      <div key={addr.id} className="p-3 bg-ivory/50 rounded-xl text-xs text-neutral-600">
                        <p className="font-semibold text-primary">{addr.address1}</p>
                        <p>{[addr.city, addr.zoneCode, addr.zip].filter(Boolean).join(", ")}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
