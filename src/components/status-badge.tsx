type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export default function StatusBadge({ status }: { status: IssueStatus }) {
  const tone =
    status === "RESOLVED"
      ? "text-emerald-300"
      : status === "IN_PROGRESS"
        ? "text-amber-300"
        : "text-rose-300";

  const label =
    status === "IN_PROGRESS"
      ? "In progress"
      : status === "RESOLVED"
        ? "Resolved"
        : "Open";

  return (
    <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
      <span className={tone}>{label}</span>
    </span>
  );
}