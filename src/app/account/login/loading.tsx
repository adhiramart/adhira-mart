export default function LoginLoading() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-white px-4 sm:px-6 py-12 md:py-20">
      <div className="w-full max-w-lg bg-white border border-border/80 rounded-3xl p-6 sm:p-10 shadow-sm animate-pulse space-y-6">
        <div className="w-24 h-4 bg-neutral-200 rounded-full mx-auto" />
        <div className="w-48 h-8 bg-neutral-200 rounded-lg mx-auto" />
        <div className="w-64 h-4 bg-neutral-200 rounded-md mx-auto" />
        <div className="space-y-3 pt-4">
          <div className="h-16 bg-neutral-100 rounded-2xl" />
          <div className="h-16 bg-neutral-100 rounded-2xl" />
        </div>
        <div className="h-12 bg-neutral-200 rounded-2xl" />
      </div>
    </div>
  );
}
