"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/empty-state";
import { getIssues } from "@/lib/store";
import type { Issue } from "@/lib/store";
import KanbanBoard from "@/components/kanban-board";

function ghostBtn(active = false): React.CSSProperties {
    return {
        padding: "10px 12px",
        borderRadius: 12,
        border: active ? "1px solid rgba(0,190,255,0.55)" : "1px solid var(--border)",
        background: active ? "rgba(0,190,255,0.10)" : "rgba(255,255,255,0.03)",
        color: "var(--text)",
        fontWeight: 1000,
        cursor: "pointer",
    };
}

function card(): React.CSSProperties {
    return {
        border: "1px solid var(--border)",
        borderRadius: 16,
        background: "var(--card)",
        boxShadow: "var(--shadow)",
        padding: 14,
    };
}

export default function RecentPage() {
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [view, setView] = useState<"board" | "list">("board");

    function refresh() {
        setIssues(getIssues());
    }

    useEffect(() => {
        setMounted(true);
        refresh();

        const sp = new URLSearchParams(window.location.search);
        setView(sp.get("view") === "list" ? "list" : "board");
    }, []);

    useEffect(() => {
        const onFocus = () => refresh();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const newest = issues[0];

    const hostelIssues = useMemo(() => issues.filter((i) => i.section === "HOSTEL"), [issues]);
    const campusIssues = useMemo(() => issues.filter((i) => i.section === "CAMPUS"), [issues]);

    function go(nextView: "board" | "list") {
        setView(nextView);
        router.push(nextView === "board" ? "/recent" : "/recent?view=list");
    }

    if (!mounted) {
        return (
            <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
                <div style={{ color: "var(--muted)" }}>Loading…</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <h2 style={{ margin: 0, fontSize: 34, fontWeight: 1000 }}>Dashboard</h2>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => router.push("/setup/section")} style={ghostBtn()}>
                        + New issue
                    </button>

                    <button onClick={() => go("board")} style={ghostBtn(view === "board")}>
                        Board
                    </button>
                    <button onClick={() => go("list")} style={ghostBtn(view === "list")}>
                        List
                    </button>
                </div>
            </div>

            {issues.length === 0 ? (
                <div style={{ marginTop: 18 }}>
                    <EmptyState
                        title="No issues yet"
                        subtitle="When students raise issues, they'll appear here."
                    />
                </div>
            ) : (
                <>
                    <div style={{ marginTop: 18, ...card() }}>
                        <div style={{ fontWeight: 1000, color: "var(--muted)" }}>Latest</div>
                        <div style={{ marginTop: 8, fontWeight: 1000, fontSize: 20 }}>
                            {newest?.title || "(Untitled)"}
                        </div>
                        <div style={{ color: "var(--muted)", marginTop: 6 }}>{newest?.locationText}</div>

                        <button
                            onClick={() => newest?.id && router.push(`/issues/${newest.id}`)}
                            style={{ ...ghostBtn(false), marginTop: 12 }}
                        >
                            Open details
                        </button>
                    </div>

                    <div style={{ marginTop: 18 }}>
                        {view === "board" ? (
                            <KanbanBoard issues={issues} role="STUDENT" />
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                                <div>
                                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Hostel</div>
                                    {hostelIssues.length === 0 ? (
                                        <div
                                            style={{
                                                padding: 14,
                                                border: "1px solid var(--border)",
                                                borderRadius: 16,
                                                color: "var(--muted)",
                                            }}
                                        >
                                            No hostel issues yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gap: 12 }}>
                                            {hostelIssues.map((i) => (
                                                <button
                                                    key={i.id}
                                                    onClick={() => router.push(`/issues/${i.id}`)}
                                                    style={{ ...card(), textAlign: "left", cursor: "pointer" }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                        <div style={{ fontWeight: 1000 }}>{i.title || "(Untitled)"}</div>
                                                        <div style={{ color: "var(--muted)", fontWeight: 900 }}>
                                                            {i.priority} • {i.status}
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: 6, color: "var(--muted)" }}>{i.locationText}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div style={{ fontWeight: 1000, marginBottom: 10 }}>Campus</div>
                                    {campusIssues.length === 0 ? (
                                        <div
                                            style={{
                                                padding: 14,
                                                border: "1px solid var(--border)",
                                                borderRadius: 16,
                                                color: "var(--muted)",
                                            }}
                                        >
                                            No campus issues yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gap: 12 }}>
                                            {campusIssues.map((i) => (
                                                <button
                                                    key={i.id}
                                                    onClick={() => router.push(`/issues/${i.id}`)}
                                                    style={{ ...card(), textAlign: "left", cursor: "pointer" }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                        <div style={{ fontWeight: 1000 }}>{i.title || "(Untitled)"}</div>
                                                        <div style={{ color: "var(--muted)", fontWeight: 900 }}>
                                                            {i.priority} • {i.status}
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: 6, color: "var(--muted)" }}>{i.locationText}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}