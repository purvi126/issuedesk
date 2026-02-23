"use client";

import { useRouter } from "next/navigation";
import { addComment, updateIssue, getScore } from "@/lib/store";
import type { Issue, Status } from "@/lib/store";

type Role = "STUDENT" | "ADMIN" | "TECH";

function statusLabel(s: Status) {
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "RESOLVED") return "Resolved";
  return "Open";
}

function headerBg(s: Status) {
  switch (s) {
    case "OPEN":
      return "bg-blue-500/10";
    case "IN_PROGRESS":
      return "bg-cyan-400/10";
    case "RESOLVED":
      return "bg-emerald-400/10";
    default:
      return "bg-white/5";
  }
}

export default function KanbanBoard({
  issues,
  role = "STUDENT",
  onChanged,
}: {
  issues: Issue[];
  role?: Role; // ✅ optional now
  onChanged?: () => void;
}) {
  const router = useRouter();

  const columns: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

  const grouped = columns.map((col) => ({
    status: col,
    items: issues.filter((i) => i.status === col),
  }));

  function setStatus(id: string, status: Status) {
    updateIssue(id, { status });
    onChanged?.();
  }

  function addNote(id: string) {
    addComment(id, "Staff note added.");
    onChanged?.();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {grouped.map(({ status, items }) => (
        <section
          key={status}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          <header
            className={[
              "flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3",
              headerBg(status),
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-white/85">
              {statusLabel(status)}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
              {items.length}
            </div>
          </header>

          <div className="grid gap-3 p-4">
            {items.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
                No issues
              </div>
            ) : (
              items.map((i) => (
                <div
                  key={i.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm"
                >
                  <button
                    onClick={() => router.push(`/issues/${i.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white/90">
                          {i.title || "(Untitled)"}
                        </div>
                        <div className="mt-1 truncate text-xs text-white/60">
                          {i.locationText}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85">
                          {getScore(i)}
                        </div>
                        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/65">
                          {i.priority}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-white/60">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                        {i.category}
                      </span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                        {i.section}
                      </span>
                      {i.attachmentDataUrl ? (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1">
                          Attachment
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {(role === "ADMIN" || role === "TECH") ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {i.status === "OPEN" ? (
                        <button
                          onClick={() => setStatus(i.id, "IN_PROGRESS")}
                          className="h-9 rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                        >
                          Start
                        </button>
                      ) : null}

                      {i.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() => setStatus(i.id, "RESOLVED")}
                          className="h-9 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15"
                        >
                          Resolve
                        </button>
                      ) : null}

                      <button
                        onClick={() => addNote(i.id)}
                        className="h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
                      >
                        Add note
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}