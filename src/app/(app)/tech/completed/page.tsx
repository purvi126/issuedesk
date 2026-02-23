"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getIssues } from "@/lib/store";
import type { Issue } from "@/lib/store";

function card(): React.CSSProperties {
    return {
        border: "1px solid var(--border)",
        borderRadius: 16,
        background: "var(--card)",
        boxShadow: "var(--shadow)",
        padding: 14,
    };
}

export default function TechCompletedPage() {
    const router = useRouter();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIssues(getIssues());
    }, []);

    const closed = useMemo(() => issues.filter((i) => i.status === "RESOLVED"), [issues]);

    if (!mounted) {
        return (
            <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
                <div style={{ color: "var(--muted)" }}>Loading…</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 1000 }}>Completed</h2>
            <p style={{ marginTop: 10, color: "var(--muted)", fontWeight: 700 }}>
                Closed issues (history).
            </p>

            {closed.length === 0 ? (
                <div style={{ marginTop: 18, color: "var(--muted)" }}>No closed issues yet.</div>
            ) : (
                <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                    {closed.map((i) => (
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
    );
}