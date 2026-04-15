type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export default function StatusBadge({ status }: { status: IssueStatus }) {
  const tone =
    status === "RESOLVED"
      ? "text-emerald-700 dark:text-emerald-300"
      : status === "IN_PROGRESS"
        ? "text-amber-700 dark:text-amber-300"
        : "text-rose-700 dark:text-rose-300";

  const label =
    status === "IN_PROGRESS"
      ? "In progress"
      : status === "RESOLVED"
        ? "Resolved"
        : "Open";

  return (
    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/5">
      <span className={tone}>{label}</span>
    </span>
  );
}