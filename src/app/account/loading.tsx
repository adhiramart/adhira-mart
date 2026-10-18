export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Top Header Card Skeleton */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-10 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar Skeleton */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-200 animate-pulse shrink-0" />
            <div className="space-y-2.5">
              <div className="w-28 h-5 bg-neutral-200/80 rounded-full animate-pulse" />
              <div className="w-48 sm:w-64 h-8 bg-neutral-200 rounded-xl animate-pulse" />
              <div className="w-36 sm:w-44 h-4 bg-neutral-100 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-28 h-10 bg-neutral-100 rounded-xl animate-pulse" />
            <div className="w-28 h-10 bg-neutral-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* 2-Column Grid: Orders (Left 2 cols) and Account Details (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Order History Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-40 h-7 bg-neutral-200 rounded-lg animate-pulse" />
              <div className="w-20 h-6 bg-neutral-100 rounded-full animate-pulse" />
            </div>

            {/* Order Card 1 Skeleton */}
            <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1.5">
                  <div className="w-28 h-5 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="w-36 h-4 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-6 bg-neutral-100 rounded-full animate-pulse" />
                  <div className="w-20 h-6 bg-neutral-100 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Order Items Placeholder */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded-2xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-5 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="w-28 h-4 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="w-20 h-6 bg-neutral-200 rounded-md animate-pulse shrink-0" />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="w-32 h-5 bg-neutral-100 rounded-md animate-pulse" />
                <div className="w-28 h-9 bg-neutral-200 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Order Card 2 Skeleton */}
            <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                <div className="space-y-1.5">
                  <div className="w-28 h-5 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="w-36 h-4 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-6 bg-neutral-100 rounded-full animate-pulse" />
                  <div className="w-20 h-6 bg-neutral-100 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-200 rounded-2xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-2/3 h-5 bg-neutral-200 rounded-md animate-pulse" />
                  <div className="w-24 h-4 bg-neutral-100 rounded-md animate-pulse" />
                </div>
                <div className="w-20 h-6 bg-neutral-200 rounded-md animate-pulse shrink-0" />
              </div>
            </div>
          </div>

          {/* Sidebar Column: Account Details Skeleton */}
          <div className="space-y-6">
            <div className="w-36 h-7 bg-neutral-200 rounded-lg animate-pulse mb-2" />

            {/* Profile Info Card Skeleton */}
            <div className="bg-white border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="w-32 h-5 bg-neutral-200 rounded-md animate-pulse" />
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <div className="w-20 h-4 bg-neutral-100 rounded-md animate-pulse" />
                  <div className="w-32 h-4 bg-neutral-200 rounded-md animate-pulse" />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <div className="w-16 h-4 bg-neutral-100 rounded-md animate-pulse" />
                  <div className="w-40 h-4 bg-neutral-200 rounded-md animate-pulse" />
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="w-24 h-4 bg-neutral-100 rounded-md animate-pulse" />
                  <div className="w-28 h-4 bg-neutral-200 rounded-md animate-pulse" />
                </div>
              </div>
            </div>

            {/* Shipping Address Card Skeleton */}
            <div className="bg-white border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="w-36 h-5 bg-neutral-200 rounded-md animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="w-3/4 h-4 bg-neutral-200 rounded-md animate-pulse" />
                <div className="w-full h-4 bg-neutral-100 rounded-md animate-pulse" />
                <div className="w-2/3 h-4 bg-neutral-100 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Security & Authentication Skeleton */}
            <div className="bg-white border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="w-40 h-5 bg-neutral-200 rounded-md animate-pulse" />
              <div className="w-full h-4 bg-neutral-100 rounded-md animate-pulse" />
              <div className="w-28 h-4 bg-red-100 rounded-md animate-pulse pt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
