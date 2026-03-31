"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredRole, type AppRole } from "@/lib/role";
import EmptyState from "@/components/empty-state";
import KanbanBoard from "@/components/kanban-board";
import NoticesPopup from "@/components/notices-popup";
import type { Status, Priority, Section } from "@/lib/store";

type ViewMode = "list" | "board";
type SortMode = "NEWEST" | "OLDEST" | "TOP";
type ApiIssue = {
    _id: string;
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    section?: string;
    status?: string;
    createdByEmail?: string;
    hostelGender?: string;
    hostelName?: string;
    hostelBlock?: string;
    campusBlock?: string;
    roomNumber?: string;
    locationText?: string;
    attachmentName?: string;
    createdAt?: string;
    upvoteCount?: number;
    upvotedBy?: string[];
    comments?: unknown[];
};

type PageIssue = {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: Priority;
    section: Section;
    status: Status;
    createdById: string;
    locationText: string;
    attachmentDataUrl?: string;
    createdAt?: number;
    comments: unknown[];
    upvoteCount: number;
    upvotedBy: string[];
};
type Notice = {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    expiresAt: string;
};

type ApiNotice = {
    _id: string;
    title?: string;
    body?: string;
    createdAt?: string;
    expiresAt?: string;
};

function toUiNotice(notice: ApiNotice): Notice {
    return {
        id: notice._id,
        title: notice.title?.trim() || "(Untitled)",
        body: notice.body?.trim() || "",
        createdAt: notice.createdAt || "",
        expiresAt: notice.expiresAt || "",
    };
}
function statusLabel(s: Status) {
    if (s === "IN_PROGRESS") return "In progress";
    if (s === "RESOLVED") return "Resolved";
    return "Open";
}

function creatorLabel(i: PageIssue) {
    const c = (i.createdById ?? "").trim();
    return c.length ? c : "Unknown";
}

function getScore(i: PageIssue) {
    return typeof i.upvoteCount === "number" ? i.upvoteCount : 0;
}

function buildLocationText(issue: ApiIssue) {
    if (issue.locationText?.trim()) return issue.locationText.trim();

    const section = issue.section?.trim().toUpperCase();

    if (section === "HOSTEL") {
        const block = issue.hostelBlock?.trim() || issue.hostelName?.trim() || "";
        const parts = [
            issue.hostelGender?.trim(),
            block ? `Block ${block}` : "",
            issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
        ].filter(Boolean);

        return parts.join(", ");
    }

    if (section === "CAMPUS") {
        const parts = [
            issue.campusBlock?.trim(),
            issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
        ].filter(Boolean);

        return parts.join(", ");
    }

    return "";
}
function toPageIssue(issue: ApiIssue): PageIssue {
    const createdAt =
        issue.createdAt && !Number.isNaN(new Date(issue.createdAt).getTime())
            ? new Date(issue.createdAt).getTime()
            : Date.now();

    const priority = (issue.priority?.trim().toUpperCase() || "LOW") as Priority;
    const section = (issue.section?.trim().toUpperCase() || "HOSTEL") as Section;
    const status = (issue.status?.trim().toUpperCase() || "OPEN") as Status;

    return {
        id: issue._id,
        title: issue.title?.trim() || "(Untitled)",
        description: issue.description?.trim() || "",
        category: issue.category?.trim() || "General",
        priority,
        section,
        status,
        createdById: issue.createdByEmail?.trim() || "",
        locationText: buildLocationText(issue),
        attachmentDataUrl: issue.attachmentName?.trim()
            ? issue.attachmentName.trim()
            : "",
        createdAt,
        comments: Array.isArray(issue.comments) ? issue.comments : [],
        upvoteCount:
            typeof issue.upvoteCount === "number" && issue.upvoteCount >= 0
                ? issue.upvoteCount
                : 0,
        upvotedBy: Array.isArray(issue.upvotedBy)
            ? issue.upvotedBy.filter((value): value is string => typeof value === "string")
            : [],
    };
}

export default function IssuesPageInner() {
    const router = useRouter();
    const sp = useSearchParams();
    const { data: session } = useSession();
    const viewFromUrl: ViewMode = sp.get("view") === "board" ? "board" : "list";

    const [mounted, setMounted] = useState(false);
    const [issues, setIssues] = useState<PageIssue[]>([]);
    const [role, setRole] = useState<AppRole | null>(null);

    const [q, setQ] = useState("");
    const [status, setStatus] = useState<Status | "ALL">("ALL");
    const [priority, setPriority] = useState<Priority | "ALL">("ALL");
    const [section, setSection] = useState<Section | "ALL">("ALL");
    const [category, setCategory] = useState<string>("ALL");
    const [creator, setCreator] = useState<string>("ALL");
    const [sort, setSort] = useState<SortMode>("NEWEST");
    const [showNotices, setShowNotices] = useState(false);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [togglingVoteId, setTogglingVoteId] = useState<string | null>(null);
    const voterId = session?.user?.email?.trim() || "";
    const isStudent = role === "STUDENT";
    const isStaff = role === "TECH";
    const isAdmin = role === "ADMIN";
    const isPrivileged = isStaff || isAdmin;

    useEffect(() => {
        setMounted(true);
        setRole(getStoredRole());
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let ignore = false;

        async function loadIssues() {
            try {
                const res = await fetch("/api/issues", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load issues");
                }

                const mapped = Array.isArray(data.issues)
                    ? data.issues.map(toPageIssue)
                    : [];

                if (!ignore) {
                    setIssues(mapped);
                }
            } catch (error) {
                console.error("Failed to load issues:", error);
                if (!ignore) {
                    setIssues([]);
                }
            }
        }

        loadIssues();

        return () => {
            ignore = true;
        };
    }, [mounted]);

    useEffect(() => {
        if (!mounted || !isStudent) return;

        let ignore = false;

        async function loadNotices() {
            try {
                const res = await fetch("/api/notices", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load notices");
                }

                const active = Array.isArray(data.notices)
                    ? data.notices.map(toUiNotice)
                    : [];

                if (ignore) return;

                setNotices(active);

                if (active.length === 0) {
                    setShowNotices(false);
                    return;
                }

                const seen = sessionStorage.getItem("issues_notices_seen");
                if (!seen) {
                    setShowNotices(true);
                }
            } catch (error) {
                console.error("Failed to load notices:", error);
                if (!ignore) {
                    setNotices([]);
                    setShowNotices(false);
                }
            }
        }

        loadNotices();

        return () => {
            ignore = true;
        };
    }, [mounted, isStudent]);

    useEffect(() => {
        if (!mounted) return;

        async function handleWindowFocus() {
            try {
                const res = await fetch("/api/issues", { cache: "no-store" });
                const data = await res.json();

                if (res.ok) {
                    const mapped = Array.isArray(data.issues)
                        ? data.issues.map(toPageIssue)
                        : [];
                    setIssues(mapped);
                }
            } catch (error) {
                console.error("Failed to refresh issues:", error);
            }

            setRole(getStoredRole());

            try {
                const noticesRes = await fetch("/api/notices", { cache: "no-store" });
                const noticesData = await noticesRes.json();

                if (noticesRes.ok) {
                    const active = Array.isArray(noticesData.notices)
                        ? noticesData.notices.map(toUiNotice)
                        : [];
                    setNotices(active);
                }
            } catch (error) {
                console.error("Failed to refresh notices:", error);
            }
        }

        window.addEventListener("focus", handleWindowFocus);
        return () => window.removeEventListener("focus", handleWindowFocus);
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
        router.push(nextView === "board" ? "/issues?view=board" : "/issues");
    }

    function closeNotices() {
        sessionStorage.setItem("issues_notices_seen", "true");
        setShowNotices(false);
    }

    const oneWeekAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

    const activeIssues = useMemo(() => {
        return issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS");
    }, [issues]);

    const recentlyResolved = useMemo(() => {
        return issues
            .filter(
                (i) =>
                    i.status === "RESOLVED" &&
                    typeof i.createdAt === "number" &&
                    i.createdAt >= oneWeekAgo
            )
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
            .slice(0, 5);
    }, [issues, oneWeekAgo]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        const hitsQuery = (i: PageIssue) => {
            if (!query) return true;
            const hay =
                `${i.title ?? ""} ${i.description ?? ""} ${i.locationText ?? ""} ${i.category ?? ""} ${creatorLabel(i)}`.toLowerCase();
            return hay.includes(query);
        };

        const base = activeIssues
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
    }, [activeIssues, q, status, priority, section, category, creator, sort]);
    async function handleToggleUpvote(issueId: string) {
        if (!voterId) {
            alert("Please sign in to upvote.");
            router.push(`/login?next=/issues/${issueId}`);
            return;
        }

        try {
            setTogglingVoteId(issueId);

            const res = await fetch(`/api/issues/${issueId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    toggleUpvote: true,
                    voterId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to toggle upvote");
            }

            setIssues((prev) =>
                prev.map((issue) =>
                    issue.id === issueId ? toPageIssue(data.issue) : issue
                )
            );
        } catch (error) {
            console.error("Failed to toggle upvote:", error);
            alert(error instanceof Error ? error.message : "Failed to toggle upvote");
        } finally {
            setTogglingVoteId(null);
        }
    }
    async function refresh() {
        try {
            const res = await fetch("/api/issues", { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || "Failed to refresh issues");
            }

            const mapped = Array.isArray(data.issues)
                ? data.issues.map(toPageIssue)
                : [];

            setIssues(mapped);
        } catch (error) {
            console.error("Failed to refresh issues:", error);
            setIssues([]);
        }
    }

    function clearFilters() {
        setQ("");
        setStatus("ALL");
        setPriority("ALL");
        setSection("ALL");
        setCategory("ALL");
        setCreator("ALL");
        setSort("NEWEST");
    }

    if (!mounted) {
        return (
            <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="text-sm text-white/60">Loading issues...</div>
                </div>
            </main>
        );
    }

    return (
        <>
            {isStudent && notices.length > 0 ? (
                <NoticesPopup open={showNotices} notices={notices} onClose={closeNotices} />
            ) : null}

            <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {isPrivileged ? "All Issues" : "Issues"}
                            </h1>
                            <p className="mt-1 text-sm text-white/60">
                                {isStaff
                                    ? "Browse active issues across campus."
                                    : isAdmin
                                        ? "Review active issues across the system."
                                        : "Browse active issues, switch views, or raise a new one."}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="flex h-12 rounded-xl border border-blue-400/25 bg-white/[0.04] p-1 shadow-sm">
                                <button
                                    onClick={() => go("list")}
                                    className={[
                                        "h-10 rounded-lg px-5 text-sm font-semibold transition",
                                        viewFromUrl === "list"
                                            ? "border border-blue-400/40 bg-blue-500/20 text-white"
                                            : "text-white/65 hover:bg-white/5 hover:text-white",
                                    ].join(" ")}
                                >
                                    List
                                </button>
                                <button
                                    onClick={() => go("board")}
                                    className={[
                                        "h-10 rounded-lg px-5 text-sm font-semibold transition",
                                        viewFromUrl === "board"
                                            ? "border border-blue-400/40 bg-blue-500/20 text-white"
                                            : "text-white/65 hover:bg-white/5 hover:text-white",
                                    ].join(" ")}
                                >
                                    Board
                                </button>
                            </div>

                            {isStudent ? (
                                <button
                                    onClick={() => router.push("/setup/section")}
                                    className="h-12 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    + New issue
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {activeIssues.length === 0 && recentlyResolved.length === 0 ? (
                        <div className="mt-6">
                            <EmptyState
                                title={isPrivileged ? "No issues found" : "No issues yet"}
                                subtitle={
                                    isPrivileged
                                        ? "There are no active or recently resolved issues right now."
                                        : "Create one to see it appear here."
                                }
                                actionLabel={isStudent ? "New issue" : undefined}
                                onAction={isStudent ? () => router.push("/setup/section") : undefined}
                            />
                        </div>
                    ) : viewFromUrl === "board" ? (
                        <>
                            <div className="mt-6">
                                <KanbanBoard issues={filtered as never} />
                            </div>

                            {recentlyResolved.length > 0 ? (
                                <div className="mt-8">
                                    <div className="mb-3">
                                        <h2 className="text-lg font-semibold text-white/90">Recently resolved</h2>
                                        <p className="mt-1 text-sm text-white/55">Resolved in the last 7 days.</p>
                                    </div>

                                    <div className="grid gap-3">
                                        {recentlyResolved.map((i) => (
                                            <button
                                                key={`resolved-${i.id}`}
                                                onClick={() => router.push(`/issues/${i.id}`)}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-blue-400/25 hover:bg-blue-500/5"
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
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right text-xs text-emerald-300">
                                                        Resolved
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </>
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
                                                placeholder="Search title, location, creator..."
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
                                        <span className="font-semibold text-white/80">{activeIssues.length}</span>
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
                                                        <div className="mt-1 text-sm text-white/60">
                                                            {i.locationText || "Location not provided"}
                                                        </div>
                                                        <div className="mt-2 text-xs text-white/55">
                                                            {i.section} • {i.category} • by{" "}
                                                            <span className="font-semibold text-white/75">{creatorLabel(i)}</span>
                                                            {i.attachmentDataUrl ? " • Attachment" : ""}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right text-xs text-white/60">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void handleToggleUpvote(i.id);
                                                            }}
                                                            disabled={togglingVoteId === i.id}
                                                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:border-blue-400/30 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                                            title={!voterId ? "Sign in to upvote" : i.upvotedBy.includes(voterId) ? "Remove upvote" : "Upvote"}
                                                        >
                                                            ▲ {getScore(i)}
                                                        </button>

                                                        <div className="mt-2">
                                                            {i.priority} • {statusLabel(i.status)}
                                                        </div>

                                                        {!voterId ? (
                                                            <div className="mt-1 text-[11px] text-white/45">Sign in to vote</div>
                                                        ) : i.upvotedBy.includes(voterId) ? (
                                                            <div className="mt-1 text-[11px] text-white/45">You upvoted</div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {recentlyResolved.length > 0 ? (
                                <div className="mt-8">
                                    <div className="mb-3">
                                        <h2 className="text-lg font-semibold text-white/90">Recently resolved</h2>
                                        <p className="mt-1 text-sm text-white/55">Resolved in the last 7 days.</p>
                                    </div>

                                    <div className="grid gap-3">
                                        {recentlyResolved.map((i) => (
                                            <button
                                                key={`resolved-${i.id}`}
                                                onClick={() => router.push(`/issues/${i.id}`)}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-blue-400/25 hover:bg-blue-500/5"
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
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right text-xs text-emerald-300">
                                                        Resolved
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}