type ReviewState = "PENDING" | "ASSIGNED" | "REJECTED";

export default function ReviewStateBadge({
  reviewState,
}: {
  reviewState: ReviewState;
}) {
  const tone =
    reviewState === "ASSIGNED"
      ? "text-cyan-700 dark:text-cyan-300"
      : reviewState === "REJECTED"
        ? "text-rose-700 dark:text-rose-300"
        : "text-amber-700 dark:text-amber-300";

  const label =
    reviewState === "ASSIGNED"
      ? "Assigned"
      : reviewState === "REJECTED"
        ? "Rejected"
        : "Pending";

  return (
    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5">
      <span className={tone}>{label}</span>
    </span>
  );
}