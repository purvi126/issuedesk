"use client";

import { useEffect, useState } from "react";
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

export default function AdminBoardPage() {
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

    function go(nextView: "board" | "list") {
        setView(nextView);
        router.push(nextView === "board" ? "/admin/board" : "/admin/board?view=list");
    }

    if (!mounted) {
        return (
            <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
                <div style={{ color: "var(--muted)" }}>Loading…</div>
            </div>
        );
    }

    const openCount = issues.filter((i) => i.status === "OPEN").length;

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
                <h2 style={{ margin: 0, fontSize: 34, fontWeight: 1000 }}>Admin board</h2>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => router.push("/recent")} style={ghostBtn()}>
                        Back to My Issues
                    </button>

                    <button onClick={refresh} style={ghostBtn()}>
                        Refresh
                    </button>

                    <button onClick={() => go("board")} style={ghostBtn(view === "board")}>
                        Board
                    </button>

                    <button onClick={() => go("list")} style={ghostBtn(view === "list")}>
                        List
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 12, color: "var(--muted)", fontWeight: 800 }}>Open issues: {openCount}</div>

            <div style={{ marginTop: 18 }}>
                {view === "board" ? (
                    <KanbanBoard issues={issues} role="ADMIN" onChanged={refresh} />
                ) : issues.length === 0 ? (
                    <div style={{ marginTop: 18 }}>
                        <EmptyState
                            title="Nothing assigned yet"
                            subtitle="Ask admin to assign an issue to your queue."
                        />
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                        {issues.map((i) => (
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
                                <div style={{ marginTop: 10, color: "var(--muted)", fontWeight: 800 }}>
                                    {i.section} • {i.category}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}