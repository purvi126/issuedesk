"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";
import { getIssues, type Issue } from "@/lib/store";

type ViewMode = "board" | "list";

export default function AdminBoardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewMode>("board");
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const role = getStoredRole();

    if (role !== "ADMIN") {
      router.replace("/setup/role");
      return;
    }

    setReady(true);
  }, [router]);

  const openIssues = useMemo(
    () => issues.filter((issue: Issue) => issue.status === "OPEN"),
    [issues]
  );

  const inProgressIssues = useMemo(
    () => issues.filter((issue: Issue) => issue.status === "IN_PROGRESS"),
    [issues]
  );

  const resolvedIssues = useMemo(
    () => issues.filter((issue: Issue) => issue.status === "RESOLVED"),
    [issues]
  );

  if (!ready) return null;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Admin Board
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Monitor issue flow across campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIssues(getIssues())}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:border-cyan-400/25 hover:bg-cyan-500/5"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setView("board")}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                view === "board"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              Board
            </button>

            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                view === "list"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {view === "board" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <StatusColumn title="Open" items={openIssues} />
            <StatusColumn title="In progress" items={inProgressIssues} />
            <StatusColumn title="Resolved" items={resolvedIssues} />
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 text-sm font-semibold text-white/70">
              All issues
            </div>
            <div className="space-y-3">
              {issues.length === 0 ? (
                <div className="rounded-2xl border border-white/10 px-4 py-6 text-sm text-white/50">
                  No issues found.
                </div>
              ) : (
                issues.map((issue: Issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatusColumn({
  title,
  items,
}: {
  title: string;
  items: Issue[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="rounded-xl border border-white/10 px-3 py-1 text-sm text-white/60">
          {items.length}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 px-4 py-5 text-sm text-white/50">
            No issues
          </div>
        ) : (
          items.map((issue: Issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </section>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-lg font-semibold text-white/90">{issue.title}</div>
      <div className="mt-1 text-sm text-white/55">{issue.locationText}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-xl border border-white/10 px-3 py-1 text-xs text-white/65">
          {issue.category}
        </span>
        <span className="rounded-xl border border-white/10 px-3 py-1 text-xs text-white/65">
          {issue.section}
        </span>
        <span className="rounded-xl border border-white/10 px-3 py-1 text-xs text-white/65">
          {issue.priority}
        </span>
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-white/90">{issue.title}</div>
          <div className="text-sm text-white/55">{issue.locationText}</div>
        </div>
        <div className="text-xs text-white/60">{issue.status}</div>
      </div>
    </div>
  );
}