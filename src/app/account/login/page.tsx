import Link from "next/link";
import { getCustomerSession, getShopifyAuthConfig } from "@/lib/shopify-customer";
import { redirect } from "next/navigation";


export const metadata = {
  title: "Sign In | Adhira Mart",
  description: "Sign in or register for your Adhira Mart account with Shopify passwordless authentication.",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    return_to?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCustomerSession();
  const params = await searchParams;

  // If already logged in, redirect straight to account dashboard
  if (session?.accessToken) {
    redirect(params.return_to || "/account");
  }

  const { clientId, shopId } = getShopifyAuthConfig();
  const isMissingClientId = !clientId;
  const errorMessage = params.error;

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4 sm:px-6 py-12 md:py-20">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-taupe px-3 py-1 rounded-full bg-ivory mb-3">
              Customer Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary">
              Sign In / Register
            </h1>
            <p className="text-sm text-muted mt-2 max-w-sm mx-auto leading-relaxed">
              Experience seamless, passwordless login powered by Shopify and Shop Pay.
            </p>
          </div>

          {/* Missing Client ID Setup Notice */}
          {isMissingClientId && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-950">
                <svg className="w-4 h-4 shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Shopify Setup Required</span>
              </div>
              <p className="text-amber-800 leading-relaxed mb-2">
                To test the live redirect, add your Customer Account Client ID to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-amber-900/90 font-mono text-[11px] bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/50">
                <li>Shopify Admin &rarr; Settings &rarr; Customer accounts</li>
                <li>Ensure &ldquo;New customer accounts&rdquo; is active</li>
                <li>Sales channels &rarr; Headless &rarr; Customer Account API</li>
                <li>Add Callback URI: <span className="underline">http://localhost:3000/api/auth/callback</span></li>
                <li>Copy Client ID &rarr; <span className="font-bold">SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</span></li>
              </ol>
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && errorMessage !== "missing_client_id" && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
              <span>{decodeURIComponent(errorMessage)}</span>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-ivory/60 border border-black/5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">
                ⚡
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  100% Passwordless
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  No passwords to remember. Verify with a quick 6-digit email code or 1-tap Shop Pay.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-ivory/60 border border-black/5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">
                🔒
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Shopify & Shop Pay Protection
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Enterprise-grade OAuth 2.0 security directly connected to your store checkout.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-ivory/60 border border-black/5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">
                📦
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Full Account Control
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  Access live order tracking, past receipts, and saved addresses in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <Link
              href="/api/auth/login"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-primary text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-md group"
            >
              <span>Continue to Sign In / Sign Up</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/"
              className="w-full block text-center py-2.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
            >
              &larr; Return to Shopping
            </Link>
          </div>
        </div>

        {/* Footer Meta */}
        <p className="text-center text-[11px] text-muted-light mt-6">
          Powered by Shopify Customer Accounts &bull; Shop ID: {shopId}
        </p>
      </div>
    </div>
  );
}
