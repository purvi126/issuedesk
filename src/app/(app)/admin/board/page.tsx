"use client";

import PageHeader from "@/components/page-header";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";
import StatusBadge from "@/components/status-badge";
import ReviewStateBadge from "@/components/review-state-badge";

type ViewMode = "board" | "list";
type ReviewState = "PENDING" | "ASSIGNED" | "REJECTED";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

type Issue = {
  id: string;
  title: string;
  locationText: string;
  category: string;
  section: string;
  priority: string;
  status: Status;
  reviewState?: ReviewState;
};

type ApiIssue = {
  _id: string;
  title?: string;
  category?: string;
  section?: string;
  priority?: string;
  status?: string;
  locationText?: string;
  hostelGender?: string;
  hostelName?: string;
  hostelBlock?: string;
  campusBlock?: string;
  roomNumber?: string;
  reviewState?: ReviewState;
};

function buildLocationText(issue: ApiIssue) {
  if (issue.locationText?.trim()) return issue.locationText.trim();

  const section = issue.section?.trim().toUpperCase();

  if (section === "HOSTEL") {
    const block = issue.hostelBlock?.trim() || issue.hostelName?.trim() || "";
    const parts = [
      issue.hostelGender?.trim(),
      block ? `Hostel ${block}` : "",
      issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
    ].filter(Boolean);

    return parts.join(" • ");
  }

  if (section === "CAMPUS") {
    const parts = [
      issue.campusBlock?.trim(),
      issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
    ].filter(Boolean);

    return parts.join(" • ");
  }

  return "";
}

function toUiIssue(issue: ApiIssue): Issue {
  return {
    id: issue._id,
    title: issue.title?.trim() || "(Untitled)",
    locationText: buildLocationText(issue),
    category: issue.category?.trim() || "General",
    section: issue.section?.trim() || "Unknown",
    priority: issue.priority?.trim() || "LOW",
    status: (issue.status?.trim() as Status) || "OPEN",
    reviewState: issue.reviewState || "PENDING",
  };
}

export default function AdminBoardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewMode>("board");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshIssues() {
    try {
      setRefreshing(true);

      const res = await fetch("/api/issues", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load issues");
      }

      const mapped = Array.isArray(data.issues) ? data.issues.map(toUiIssue) : [];
      setIssues(mapped);
    } catch (error) {
      console.error("[admin/board] load failed:", error);
      setIssues([]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleUpdateIssue(id: string, patch: Partial<Issue>) {
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to update issue");
      }

      await refreshIssues();
    } catch (error) {
      console.error("[admin/board] update failed:", error);
      alert(error instanceof Error ? error.message : "Failed to update issue");
    }
  }

  useEffect(() => {
    const role = getStoredRole();

    if (role !== "ADMIN") {
      router.replace("/setup/role");
      return;
    }

    refreshIssues();
    setReady(true);
  }, [router]);

  useEffect(() => {
    function handleWindowFocus() {
      refreshIssues();
    }

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const pendingIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (issue.reviewState ?? "PENDING") === "PENDING" &&
          issue.status !== "RESOLVED"
      ),
    [issues]
  );

  const assignedIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (issue.reviewState ?? "PENDING") === "ASSIGNED" &&
          issue.status !== "RESOLVED"
      ),
    [issues]
  );

  const rejectedIssues = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (issue.reviewState ?? "PENDING") === "REJECTED" &&
          issue.status !== "RESOLVED"
      ),
    [issues]
  );

  const resolvedIssues = useMemo(
    () => issues.filter((issue) => issue.status === "RESOLVED"),
    [issues]
  );

  const visibleListIssues = useMemo(
    () => [...pendingIssues, ...assignedIssues, ...rejectedIssues],
    [pendingIssues, assignedIssues, rejectedIssues]
  );

  if (!ready) return null;

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Admin Board"
          subtitle="Review incoming issues and route them to staff or reject them."
        />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshIssues}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:border-cyan-400/25 hover:bg-cyan-500/5"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setView("board")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  view === "board"
                    ? "border border-cyan-400/30 bg-cyan-500/10 text-white"
                    : "text-white/70"
                }`}
              >
                Board
              </button>

              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  view === "list"
                    ? "border border-cyan-400/30 bg-cyan-500/10 text-white"
                    : "text-white/70"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {view === "board" ? (
          <div className="grid gap-4 xl:grid-cols-3">
            <AdminColumn
              title="Pending review"
              items={pendingIssues}
              onUpdate={handleUpdateIssue}
            />
            <AdminColumn
              title="Assigned to staff"
              items={assignedIssues}
              onUpdate={handleUpdateIssue}
            />
            <AdminColumn
              title="Rejected"
              items={rejectedIssues}
              onUpdate={handleUpdateIssue}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 text-sm font-semibold text-white/70">
              Admin review list
            </div>

            <div className="space-y-2">
              {visibleListIssues.length === 0 ? (
                <div className="rounded-2xl border border-white/10 px-4 py-6 text-sm text-white/50">
                  No issues found.
                </div>
              ) : (
                visibleListIssues.map((issue) => (
                  <AdminIssueRow
                    key={issue.id}
                    issue={issue}
                    onUpdate={handleUpdateIssue}
                  />
                ))
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white/90">Resolved history</h2>
            <p className="mt-1 text-sm text-white/55">
              Issues that are currently resolved.
            </p>
          </div>

          {resolvedIssues.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-white/50">
              No resolved issues yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {resolvedIssues.map((issue) => (
                <div
                  key={`resolved-${issue.id}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white/90">
                        {issue.title}
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {issue.locationText}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
                          {issue.category}
                        </span>
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
                          {issue.section}
                        </span>
                        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
                          {issue.priority}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status="RESOLVED" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function AdminColumn({
  title,
  items,
  onUpdate,
}: {
  title: string;
  items: Issue[];
  onUpdate: (id: string, patch: Partial<Issue>) => void;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="rounded-xl border border-white/10 px-3 py-1 text-sm text-white/60">
          {items.length}
        </div>
      </div>

      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 px-4 py-5 text-sm text-white/50">
            No issues
          </div>
        ) : (
          items.map((issue) => (
            <AdminIssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </section>
  );
}

function AdminIssueCard({
  issue,
  onUpdate,
}: {
  issue: Issue;
  onUpdate: (id: string, patch: Partial<Issue>) => void;
}) {
  const reviewState = issue.reviewState ?? "PENDING";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-base font-semibold text-white/90">{issue.title}</div>
      <div className="mt-1 text-sm text-white/55">{issue.locationText}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
          {issue.category}
        </span>
        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
          {issue.section}
        </span>
        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">
          {issue.priority}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <StatusBadge status={issue.status} />
        <ReviewStateBadge reviewState={reviewState} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {reviewState !== "ASSIGNED" ? (
          <button
            type="button"
            onClick={() =>
              onUpdate(issue.id, {
                reviewState: "ASSIGNED",
                status: "OPEN",
              })
            }
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
          >
            Assign to staff
          </button>
        ) : null}

        {reviewState !== "REJECTED" ? (
          <button
            type="button"
            onClick={() =>
              onUpdate(issue.id, {
                reviewState: "REJECTED",
              })
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
          >
            Reject
          </button>
        ) : null}

        {reviewState !== "PENDING" ? (
          <button
            type="button"
            onClick={() =>
              onUpdate(issue.id, {
                reviewState: "PENDING",
              })
            }
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AdminIssueRow({
  issue,
  onUpdate,
}: {
  issue: Issue;
  onUpdate: (id: string, patch: Partial<Issue>) => void;
}) {
  const reviewState = issue.reviewState ?? "PENDING";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-white/90">{issue.title}</div>
          <div className="text-sm text-white/55">{issue.locationText}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <StatusBadge status={issue.status} />
            <ReviewStateBadge reviewState={reviewState} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {reviewState !== "ASSIGNED" ? (
            <button
              type="button"
              onClick={() =>
                onUpdate(issue.id, {
                  reviewState: "ASSIGNED",
                  status: "OPEN",
                })
              }
              className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
            >
              Assign to staff
            </button>
          ) : null}

          {reviewState !== "REJECTED" ? (
            <button
              type="button"
              onClick={() =>
                onUpdate(issue.id, {
                  reviewState: "REJECTED",
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
            >
              Reject
            </button>
          ) : null}

          {reviewState !== "PENDING" ? (
            <button
              type="button"
              onClick={() =>
                onUpdate(issue.id, {
                  reviewState: "PENDING",
                })
              }
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}