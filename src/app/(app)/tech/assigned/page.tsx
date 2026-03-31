"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";

type ViewMode = "board" | "list";
type ReviewState = "PENDING" | "ASSIGNED" | "REJECTED";
type IssueStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type IssueSection = "HOSTEL" | "CAMPUS";
type IssuePriority = "LOW" | "MED" | "HIGH";

type TechIssue = {
    id: string;
    title: string;
    category: string;
    section: IssueSection;
    priority: IssuePriority;
    status: IssueStatus;
    reviewState: ReviewState;
    locationText: string;
    createdAt?: number;
};

type ApiIssue = {
    _id: string;
    title?: string;
    category?: string;
    section?: string;
    priority?: string;
    status?: string;
    reviewState?: string;
    hostelGender?: string;
    hostelName?: string;
    hostelBlock?: string;
    campusBlock?: string;
    roomNumber?: string;
    locationText?: string;
    createdAt?: string;
};

const RECENT_RESOLVED_MS = 7 * 24 * 60 * 60 * 1000;
function statusColor(status: IssueStatus) {
    if (status === "IN_PROGRESS") return "text-amber-300";
    if (status === "RESOLVED") return "text-emerald-300";
    return "text-rose-300";
}
function toSection(value?: string): IssueSection {
    return value?.trim().toUpperCase() === "CAMPUS" ? "CAMPUS" : "HOSTEL";
}

function toPriority(value?: string): IssuePriority {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "MED") return "MED";
    if (normalized === "HIGH") return "HIGH";
    return "LOW";
}

function toStatus(value?: string): IssueStatus {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "IN_PROGRESS") return "IN_PROGRESS";
    if (normalized === "RESOLVED") return "RESOLVED";
    return "OPEN";
}

function toReviewState(value?: string): ReviewState {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "ASSIGNED") return "ASSIGNED";
    if (normalized === "REJECTED") return "REJECTED";
    return "PENDING";
}

function buildLocationText(issue: ApiIssue) {
    if (issue.locationText?.trim()) return issue.locationText.trim();

    const section = toSection(issue.section);

    if (section === "HOSTEL") {
        const block = issue.hostelBlock?.trim() || issue.hostelName?.trim() || "";
        const parts = [
            issue.hostelGender?.trim(),
            block ? `Block ${block}` : "",
            issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
        ].filter(Boolean);

        return parts.join(", ");
    }

    const parts = [
        issue.campusBlock?.trim(),
        issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
    ].filter(Boolean);

    return parts.join(", ");
}

function toTechIssue(issue: ApiIssue): TechIssue {
    const createdAt =
        issue.createdAt && !Number.isNaN(new Date(issue.createdAt).getTime())
            ? new Date(issue.createdAt).getTime()
            : undefined;

    return {
        id: issue._id,
        title: issue.title?.trim() || "(Untitled)",
        category: issue.category?.trim() || "General",
        section: toSection(issue.section),
        priority: toPriority(issue.priority),
        status: toStatus(issue.status),
        reviewState: toReviewState(issue.reviewState),
        locationText: buildLocationText(issue),
        createdAt,
    };
}

export default function TechAssignedPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [view, setView] = useState<ViewMode>("board");
    const [issues, setIssues] = useState<TechIssue[]>([]);
    const [loading, setLoading] = useState(false);

    async function refreshIssues() {
        try {
            setLoading(true);

            const res = await fetch("/api/issues", { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to load issues");
            }

            const mapped: TechIssue[] = Array.isArray(data.issues)
                ? data.issues.map((issue: ApiIssue) => toTechIssue(issue))
                : [];

            setIssues(mapped);
        } catch (error) {
            console.error("[tech assigned] failed to load issues:", error);
            setIssues([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateIssue(id: string, nextStatus: IssueStatus) {
        try {
            const res = await fetch(`/api/issues/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to update issue");
            }

            await refreshIssues();
        } catch (error) {
            console.error("[tech assigned] failed to update issue:", error);
            alert(error instanceof Error ? error.message : "Failed to update issue status.");
        }
    }

    useEffect(() => {
        const role = getStoredRole();

        if (role !== "TECH") {
            router.replace("/setup/role");
            return;
        }

        void refreshIssues();
        setReady(true);
    }, [router]);

    useEffect(() => {
        function handleWindowFocus() {
            void refreshIssues();
        }

        window.addEventListener("focus", handleWindowFocus);

        return () => {
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, []);

    const assignedIssues = useMemo(
        () => issues.filter((issue) => issue.reviewState === "ASSIGNED"),
        [issues]
    );

    const openIssues = useMemo(
        () => assignedIssues.filter((issue) => issue.status === "OPEN"),
        [assignedIssues]
    );

    const inProgressIssues = useMemo(
        () => assignedIssues.filter((issue) => issue.status === "IN_PROGRESS"),
        [assignedIssues]
    );

    const recentlyResolvedIssues = useMemo(
        () =>
            assignedIssues.filter((issue) => {
                if (issue.status !== "RESOLVED") return false;
                if (typeof issue.createdAt !== "number") return false;
                return Date.now() - issue.createdAt <= RECENT_RESOLVED_MS;
            }),
        [assignedIssues]
    );

    const visibleListIssues = useMemo(
        () => [...openIssues, ...inProgressIssues, ...recentlyResolvedIssues],
        [openIssues, inProgressIssues, recentlyResolvedIssues]
    );

    if (!ready) return null;

    return (
        <main className="min-h-screen px-6 py-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold tracking-tight text-white">
                            Staff Queue
                        </h1>
                        <p className="mt-2 text-sm text-white/60">
                            Work through issues assigned by admin.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => void refreshIssues()}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:border-cyan-400/25 hover:bg-cyan-500/5"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
                            <button
                                type="button"
                                onClick={() => setView("board")}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${view === "board"
                                    ? "border border-cyan-400/30 bg-cyan-500/10 text-white"
                                    : "text-white/70"
                                    }`}
                            >
                                Board
                            </button>

                            <button
                                type="button"
                                onClick={() => setView("list")}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${view === "list"
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
                        <TechColumn title="Open" items={openIssues} onUpdate={handleUpdateIssue} />
                        <TechColumn title="In progress" items={inProgressIssues} onUpdate={handleUpdateIssue} />
                        <TechColumn title="Recently resolved" items={recentlyResolvedIssues} onUpdate={handleUpdateIssue} />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mb-4 text-sm font-semibold text-white/70">
                            Assigned queue
                        </div>

                        <div className="space-y-2">
                            {visibleListIssues.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 px-4 py-6 text-sm text-white/50">
                                    No assigned issues found.
                                </div>
                            ) : (
                                visibleListIssues.map((issue) => (
                                    <TechIssueRow
                                        key={issue.id}
                                        issue={issue}
                                        onUpdate={handleUpdateIssue}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function TechColumn({
    title,
    items,
    onUpdate,
}: {
    title: string;
    items: TechIssue[];
    onUpdate: (id: string, nextStatus: IssueStatus) => void;
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
                        <TechIssueCard key={issue.id} issue={issue} onUpdate={onUpdate} />
                    ))
                )}
            </div>
        </section>
    );
}

function TechIssueCard({
    issue,
    onUpdate,
}: {
    issue: TechIssue;
    onUpdate: (id: string, nextStatus: IssueStatus) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-base font-semibold text-white/90">{issue.title}</div>
            <div className="mt-1 text-sm text-white/55">
                {issue.locationText || "Location not provided"}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
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
            <div className="mt-3 text-xs">
                <span className={statusColor(issue.status)}>{issue.status}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {issue.status === "OPEN" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, "IN_PROGRESS")}
                        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Start
                    </button>
                ) : null}

                {issue.status === "IN_PROGRESS" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, "RESOLVED")}
                        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Resolve
                    </button>
                ) : null}

                {issue.status === "RESOLVED" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, "OPEN")}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
                    >
                        Reopen
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function TechIssueRow({
    issue,
    onUpdate,
}: {
    issue: TechIssue;
    onUpdate: (id: string, nextStatus: IssueStatus) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-base font-semibold text-white/90">{issue.title}</div>
                    <div className="text-sm text-white/55">
                        {issue.locationText || "Location not provided"}
                    </div>
                </div>
                <div className="mt-3 text-xs">
                    <span className={statusColor(issue.status)}>{issue.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {issue.status === "OPEN" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, "IN_PROGRESS")}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Start
                        </button>
                    ) : null}

                    {issue.status === "IN_PROGRESS" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, "RESOLVED")}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Resolve
                        </button>
                    ) : null}

                    {issue.status === "RESOLVED" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, "OPEN")}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
                        >
                            Reopen
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}