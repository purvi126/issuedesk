"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addComment, getIssue, updateIssue } from "@/lib/store";
import type { Status } from "@/lib/store";

export default function IssueDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = String(params.id);

    const [tick, setTick] = useState(0);
    const [text, setText] = useState("");

    const issue = useMemo(() => getIssue(id), [id, tick]);

    function bump() {
        setTick((x) => x + 1);
    }

    function postComment(issueId: string) {
        const t = text.trim();
        if (!t) return;
        addComment(issueId, t);
        setText("");
        bump();
    }

    function setStatus(issueId: string, next: Status) {
        updateIssue(issueId, { status: next });
        bump();
    }

    if (!issue) {
        return (
            <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
                <button
                    onClick={() => router.back()}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 700 }}
                >
                    Back
                </button>
                <p style={{ marginTop: 16 }}>Issue not found.</p>
            </div>
        );
    }

    const statusOrder: Status[] = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
            <button
                onClick={() => router.back()}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 700 }}
            >
                Back
            </button>

            <h2 style={{ marginTop: 16, marginBottom: 8 }}>{issue.title}</h2>
            <div style={{ color: "#555" }}>{issue.locationText}</div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>{issue.section}</span>
                <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>{issue.category}</span>
                <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                    {issue.priority} • {issue.status}
                </span>
            </div>

            <div style={{ marginTop: 16, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Description</div>
                <div style={{ whiteSpace: "pre-wrap", color: "#222" }}>{issue.description}</div>
            </div>

            {issue.attachmentDataUrl ? (
                <div style={{ marginTop: 16, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Attachment</div>
                    <img
                        src={issue.attachmentDataUrl}
                        alt={issue.attachmentName ?? "attachment"}
                        style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #eee" }}
                    />
                    {issue.attachmentName ? <div style={{ marginTop: 8, color: "#555" }}>{issue.attachmentName}</div> : null}
                </div>
            ) : null}

            <div style={{ marginTop: 18, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Status</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {statusOrder.map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(issue.id, s)}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 999,
                                border: s === issue.status ? "1px solid #111" : "1px solid #ddd",
                                background: s === issue.status ? "#111" : "#fff",
                                color: s === issue.status ? "#fff" : "#111",
                                cursor: "pointer",
                                fontWeight: 800,
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 18, padding: 14, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Comments</div>

                <div style={{ display: "grid", gap: 10 }}>
                    {issue.comments.length === 0 ? (
                        <div style={{ color: "#555" }}>No comments yet.</div>
                    ) : (
                        issue.comments
                            .slice()
                            .sort((a, b) => a.createdAt - b.createdAt)
                            .map((c) => (
                                <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                                    <div style={{ whiteSpace: "pre-wrap" }}>{c.text}</div>
                                    <div style={{ marginTop: 6, color: "#777", fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</div>
                                </div>
                            ))
                    )}
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                        style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", resize: "vertical" }}
                    />
                    <button
                        onClick={() => postComment(issue.id)}
                        style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 800 }}
                    >
                        Post comment
                    </button>
                </div>
            </div>
        </div>
    );
}
