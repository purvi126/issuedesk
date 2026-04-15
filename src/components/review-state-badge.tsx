type ReviewState = "PENDING" | "ASSIGNED" | "REJECTED";

export default function ReviewStateBadge({
  reviewState,
}: {
  reviewState: ReviewState;
}) {
  const tone =
    reviewState === "ASSIGNED"
      ? "text-cyan-300"
      : reviewState === "REJECTED"
        ? "text-rose-300"
        : "text-amber-300";

  const label =
    reviewState === "ASSIGNED"
      ? "Assigned"
      : reviewState === "REJECTED"
        ? "Rejected"
        : "Pending";

  return (
    <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
      <span className={tone}>{label}</span>
    </span>
  );
}