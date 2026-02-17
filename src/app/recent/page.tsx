"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getIssues } from "@/lib/store";

export default function RecentPage() {
  const router = useRouter();
  const issues = useMemo(() => getIssues(), []);
  const newest = issues[0];

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Recent issues</h2>

        <button
          onClick={() => router.push("/setup/section")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Create new
        </button>
      </div>

      {issues.length === 0 ? (
        <div style={{ marginTop: 18, color: "#555" }}>No issues yet.</div>
      ) : (
        <>
          <div style={{ marginTop: 18, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Latest</div>
            <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{newest?.title || "(Untitled)"}</div>
            <div style={{ color: "#555", marginTop: 6 }}>{newest?.locationText}</div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                {newest?.category}
              </span>
              <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                {newest?.priority} • {newest?.status}
              </span>
              <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                {newest?.section}
              </span>
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => newest?.id && router.push(`/issues/${newest.id}`)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Open details
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {issues.map((i) => (
              <button
                key={i.id}
                onClick={() => router.push(`/issues/${i.id}`)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  border: "1px solid #eee",
                  borderRadius: 12,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 900 }}>{i.title || "(Untitled)"}</div>
                  <span style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 999, fontWeight: 800 }}>
                    {i.priority} • {i.status}
                  </span>
                </div>

                <div style={{ color: "#555", marginTop: 6 }}>{i.locationText}</div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ padding: "6px 10px", border: "1px solid #eee", borderRadius: 999 }}>
                    {i.category}
                  </span>
                  <span style={{ padding: "6px 10px", border: "1px solid #eee", borderRadius: 999 }}>
                    {i.section}
                  </span>
                  {i.attachmentDataUrl ? (
                    <span style={{ padding: "6px 10px", border: "1px solid #eee", borderRadius: 999 }}>
                      Attachment
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
