/**
 * Route-level loading UI shown during navigation / data fetching.
 * A lightweight brand-colored spinner keeps perceived performance high.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary-100)] border-t-[var(--color-primary)]"
          role="status"
          aria-label="กำลังโหลด"
        />
        <p className="text-sm text-gray-500">กำลังโหลด...</p>
      </div>
    </div>
  );
}
