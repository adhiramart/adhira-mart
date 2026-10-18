export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
        {/* Header Skeleton */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-10 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-200" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-neutral-200 rounded-full" />
              <div className="w-48 h-7 bg-neutral-200 rounded-lg" />
              <div className="w-36 h-4 bg-neutral-200 rounded-md" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-10 bg-neutral-200 rounded-xl" />
            <div className="w-24 h-10 bg-neutral-200 rounded-xl" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 animate-pulse">
            <div className="w-36 h-6 bg-neutral-200 rounded-md mb-2" />
            <div className="bg-white border border-border/80 rounded-2xl p-6 h-48" />
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="w-36 h-6 bg-neutral-200 rounded-md mb-2" />
            <div className="bg-white border border-border/80 rounded-2xl p-6 h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}
