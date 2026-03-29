"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import EmptyState from "@/components/empty-state";
import KanbanBoard from "@/components/kanban-board";
import { getIssues, getScore } from "@/lib/store";
import type { Issue, Status, Priority, Section } from "@/lib/store";

type ViewMode = "board" | "list";
type SortMode = "NEWEST" | "OLDEST" | "TOP";

function statusLabel(s: Status) {
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "RESOLVED") return "Resolved";
  return "Open";
}

function creatorLabel(i: Issue) {
  const c = (i.createdById ?? "").trim();
  return c.length > 0 ? c : "Unknown";
}

export default function AllIssuesPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [issues, setIssues] = useState<Issue[]>([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [section, setSection] = useState<Section | "ALL">("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [creator, setCreator] = useState<string>("ALL");
  const [sort, setSort] = useState<SortMode>("NEWEST");

  useEffect(() => {
    setMounted(true);
    setView(sp.get("view") === "board" ? "board" : "list");
  }, [sp]);

  useEffect(() => {
    if (!mounted) return;

    const loadIssues = () => {
      try {
        setIssues(getIssues());
      } catch (error) {
        console.error("Failed to load issues:", error);
        setIssues([]);
      }
    };

    loadIssues();

    const onFocus = () => loadIssues();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, [mounted]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const i of issues) {
      if (i.category) set.add(i.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [issues]);

  const creators = useMemo(() => {
    const set = new Set<string>();
    for (const i of issues) {
      const c = (i.createdById ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [issues]);

  function go(nextView: ViewMode) {
    setView(nextView);
    router.push(nextView === "board" ? "/issues?view=board" : "/issues");
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const hitsQuery = (i: Issue) => {
      if (!query) return true;
      const hay =
        `${i.title ?? ""} ${i.description ?? ""} ${i.locationText ?? ""} ${i.category ?? ""} ${creatorLabel(i)}`.toLowerCase();
      return hay.includes(query);
    };

    const base = issues
      .filter((i) => (status === "ALL" ? true : i.status === status))
      .filter((i) => (priority === "ALL" ? true : i.priority === priority))
      .filter((i) => (section === "ALL" ? true : i.section === section))
      .filter((i) => (category === "ALL" ? true : i.category === category))
      .filter((i) => (creator === "ALL" ? true : creatorLabel(i) === creator))
      .filter(hitsQuery);

    const arr = base.slice();

    if (sort === "TOP") {
      arr.sort((a, b) => {
        const sa = getScore(a);
        const sb = getScore(b);
        if (sb !== sa) return sb - sa;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
      return arr;
    }

    arr.sort((a, b) => {
      const ta = typeof a.createdAt === "number" ? a.createdAt : 0;
      const tb = typeof b.createdAt === "number" ? b.createdAt : 0;
      return sort === "NEWEST" ? tb - ta : ta - tb;
    });

    return arr;
  }, [issues, q, status, priority, section, category, creator, sort]);

  function clearFilters() {
    setQ("");
    setStatus("ALL");
    setPriority("ALL");
    setSection("ALL");
    setCategory("ALL");
    setCreator("ALL");
    setSort("NEWEST");
  }

  function refresh() {
    try {
      setIssues(getIssues());
    } catch (error) {
      console.error("Failed to refresh issues:", error);
      setIssues([]);
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
          Loading recent issues...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">All issues</h1>
            <p className="mt-1 text-sm text-white/60">
              Filter and sort like a product catalog. Board and List views.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-10 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => go("list")}
                className={[
                  "h-8 rounded-lg px-3 text-sm font-semibold",
                  view === "list"
                    ? "border border-blue-400/30 bg-blue-500/15 text-blue-200"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                List
              </button>
              <button
                onClick={() => go("board")}
                className={[
                  "h-8 rounded-lg px-3 text-sm font-semibold",
                  view === "board"
                    ? "border border-blue-400/30 bg-blue-500/15 text-blue-200"
                    : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                Board
              </button>
            </div>

            <button
              onClick={() => router.push("/setup/section")}
              className="h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
            >
              + New issue
            </button>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No issues yet"
              subtitle="Create one to see it appear here."
              actionLabel="New issue"
              onAction={() => router.push("/setup/section")}
            />
          </div>
        ) : view === "board" ? (
          <div className="mt-6">
            <KanbanBoard issues={filtered} />
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid gap-4">
                <div className="grid gap-3 lg:grid-cols-6">
                  <div className="lg:col-span-2">
                    <div className="mb-2 text-xs font-semibold text-white/60">Search</div>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search title, location, creator…"
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Priority</div>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority | "ALL")}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All</option>
                      <option value="LOW">LOW</option>
                      <option value="MED">MED</option>
                      <option value="HIGH">HIGH</option>
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Section</div>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value as Section | "ALL")}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All</option>
                      <option value="HOSTEL">HOSTEL</option>
                      <option value="CAMPUS">CAMPUS</option>
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Status</div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status | "ALL")}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Sort</div>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortMode)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="NEWEST">Newest</option>
                      <option value="OLDEST">Oldest</option>
                      <option value="TOP">Top (upvotes)</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Category</div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-semibold text-white/60">Created by</div>
                    <select
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ALL">All</option>
                      {creators.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>

                  <div className="flex items-end justify-end gap-2">
                    <button
                      onClick={clearFilters}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
                    >
                      Clear
                    </button>
                    <button
                      onClick={refresh}
                      className="h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="text-sm text-white/55">
                  Showing <span className="font-semibold text-white/80">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-white/80">{issues.length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {filtered.length === 0 ? (
                <EmptyState title="No matches" subtitle="Try adjusting filters or search." />
              ) : (
                <div className="grid gap-3">
                  {filtered.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => router.push(`/issues/${i.id}`)}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left hover:border-blue-400/25 hover:bg-blue-500/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold text-white/90">
                            {i.title || "(Untitled)"}
                          </div>
                          <div className="mt-1 text-sm text-white/60">{i.locationText}</div>
                          <div className="mt-2 text-xs text-white/55">
                            {i.section} • {i.category} • by{" "}
                            <span className="font-semibold text-white/75">{creatorLabel(i)}</span>
                            {i.attachmentDataUrl ? " • Attachment" : ""}
                          </div>
                        </div>

                        <div className="shrink-0 text-right text-xs text-white/60">
                          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85">
                            {getScore(i)}
                          </div>
                          <div className="mt-2">
                            {i.priority} • {statusLabel(i.status)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}