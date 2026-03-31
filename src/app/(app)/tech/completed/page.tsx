"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";
import StatusBadge from "@/components/status-badge";
type Issue = {
    id: string;
    title: string;
    priority: string;
    status: string;
    locationText: string;
    section: string;
    category: string;
    resolvedAt?: number;
};

type ApiIssue = {
    _id: string;
    title?: string;
    priority?: string;
    status?: string;
    locationText?: string;
    section?: string;
    category?: string;
    hostelGender?: string;
    hostelName?: string;
    hostelBlock?: string;
    campusBlock?: string;
    roomNumber?: string;
    resolvedAt?: string | null;
};
function statusColor(status: string) {
    if (status === "IN_PROGRESS") return "text-amber-300";
    if (status === "RESOLVED") return "text-emerald-300";
    return "text-rose-300";
}
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
        priority: issue.priority?.trim() || "LOW",
        status: issue.status?.trim() || "OPEN",
        locationText: buildLocationText(issue),
        section: issue.section?.trim() || "Unknown",
        category: issue.category?.trim() || "General",
        resolvedAt:
            issue.resolvedAt && !Number.isNaN(new Date(issue.resolvedAt).getTime())
                ? new Date(issue.resolvedAt).getTime()
                : undefined,
    };
}

export default function TechCompletedPage() {
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const role = getStoredRole();

        if (role !== "TECH") {
            router.replace("/setup/role");
            return;
        }

        let ignore = false;

        async function loadIssues() {
            try {
                const res = await fetch("/api/issues", { cache: "no-store" });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load issues");
                }

                const mapped: Issue[] = Array.isArray(data.issues)
                    ? data.issues.map((issue: ApiIssue) => toUiIssue(issue))
                    : [];

                if (!ignore) {
                    setIssues(mapped);
                    setReady(true);
                }
            } catch (error) {
                console.error("[tech/completed] load failed:", error);
                if (!ignore) {
                    setIssues([]);
                    setReady(true);
                }
            }
        }

        void loadIssues();

        function handleWindowFocus() {
            void loadIssues();
        }

        window.addEventListener("focus", handleWindowFocus);

        return () => {
            ignore = true;
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, [router]);

    const closed = useMemo(
        () =>
            issues
                .filter((issue) => issue.status === "RESOLVED")
                .sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0)),
        [issues]
    );

    if (!ready) {
        return (
            <main className="min-h-screen px-6 py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="text-sm text-white/60">Loading...</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-6 py-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-4xl font-semibold tracking-tight text-white">
                        Completed
                    </h1>
                    <p className="mt-2 text-sm text-white/60">
                        Closed issues history.
                    </p>
                </div>

                {closed.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
                        No closed issues yet.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {closed.map((issue) => (
                            <button
                                key={issue.id}
                                onClick={() => router.push(`/issues/${issue.id}`)}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-400/25 hover:bg-cyan-500/5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold text-white/90">
                                            {issue.title || "(Untitled)"}
                                        </div>
                                        <div className="mt-1 text-sm text-white/60">
                                            {issue.locationText || "Location not provided"}
                                        </div>
                                        <div className="mt-2 text-xs text-white/55">
                                            {issue.section} • {issue.category}
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right text-xs text-white/60">
                                        <div className="flex justify-end">
                                            <StatusBadge status="RESOLVED" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}