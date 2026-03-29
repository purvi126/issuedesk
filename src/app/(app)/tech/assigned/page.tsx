"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";
import { getIssues, updateIssue, type Issue } from "@/lib/store";

type ViewMode = "board" | "list";

const RECENT_RESOLVED_MS = 7 * 24 * 60 * 60 * 1000;

export default function TechAssignedPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [view, setView] = useState<ViewMode>("board");
    const [issues, setIssues] = useState<Issue[]>([]);

    function refreshIssues() {
        setIssues(getIssues());
    }

    function handleUpdateIssue(id: string, patch: Partial<Issue>) {
        updateIssue(id, patch);
        refreshIssues();
    }

    useEffect(() => {
        const role = getStoredRole();

        if (role !== "TECH") {
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

        function handleStorage() {
            refreshIssues();
        }

        window.addEventListener("focus", handleWindowFocus);
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener("focus", handleWindowFocus);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const openIssues = useMemo(
        () =>
            issues.filter(
                (issue: Issue) =>
                    issue.reviewState === "ASSIGNED" && issue.status === "OPEN"
            ),
        [issues]
    );

    const inProgressIssues = useMemo(
        () =>
            issues.filter(
                (issue: Issue) =>
                    issue.reviewState === "ASSIGNED" && issue.status === "IN_PROGRESS"
            ),
        [issues]
    );

    const recentlyResolvedIssues = useMemo(
        () =>
            issues.filter((issue: Issue) => {
                if (issue.reviewState !== "ASSIGNED") return false;
                if (issue.status !== "RESOLVED") return false;
                if (!issue.resolvedAt) return false;
                return Date.now() - issue.resolvedAt <= RECENT_RESOLVED_MS;
            }),
        [issues]
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
                            Work through active requests and recent closures.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={refreshIssues}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 hover:border-cyan-400/25 hover:bg-cyan-500/5"
                        >
                            Refresh
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
                        <TechColumn
                            title="Recently resolved"
                            items={recentlyResolvedIssues}
                            onUpdate={handleUpdateIssue}
                        />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="mb-4 text-sm font-semibold text-white/70">
                            Queue list
                        </div>

                        <div className="space-y-2">
                            {visibleListIssues.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 px-4 py-6 text-sm text-white/50">
                                    No issues found.
                                </div>
                            ) : (
                                visibleListIssues.map((issue: Issue) => (
                                    <TechIssueRow key={issue.id} issue={issue} onUpdate={handleUpdateIssue} />
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
                    items.map((issue: Issue) => (
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
    issue: Issue;
    onUpdate: (id: string, patch: Partial<Issue>) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-base font-semibold text-white/90">{issue.title}</div>
            <div className="mt-1 text-sm text-white/55">{issue.locationText}</div>

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

            <div className="mt-3 flex flex-wrap gap-2">
                {issue.status === "OPEN" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, { status: "IN_PROGRESS" })}
                        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Start
                    </button>
                ) : null}

                {issue.status === "IN_PROGRESS" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, { status: "RESOLVED" })}
                        className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Resolve
                    </button>
                ) : null}

                {issue.status === "RESOLVED" ? (
                    <button
                        type="button"
                        onClick={() => onUpdate(issue.id, { status: "IN_PROGRESS" })}
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
    issue: Issue;
    onUpdate: (id: string, patch: Partial<Issue>) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-base font-semibold text-white/90">{issue.title}</div>
                    <div className="text-sm text-white/55">{issue.locationText}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {issue.status === "OPEN" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, { status: "IN_PROGRESS" })}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Start
                        </button>
                    ) : null}

                    {issue.status === "IN_PROGRESS" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, { status: "RESOLVED" })}
                            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Resolve
                        </button>
                    ) : null}

                    {issue.status === "RESOLVED" ? (
                        <button
                            type="button"
                            onClick={() => onUpdate(issue.id, { status: "IN_PROGRESS" })}
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