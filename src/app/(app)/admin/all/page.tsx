"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Issue = {
  id: string;
  title: string;
  priority: string;
  status: string;
  locationText: string;
  section: string;
  category: string;
  createdAt?: string;
};

type ApiIssue = {
  _id: string;
  title?: string;
  priority?: string;
  status?: string;
  locationText?: string;
  section?: string;
  category?: string;
  createdAt?: string;
  hostelGender?: string;
  hostelName?: string;
  hostelBlock?: string;
  campusBlock?: string;
  roomNumber?: string;
};

function card(): React.CSSProperties {
  return {
    border: "1px solid var(--border)",
    borderRadius: 16,
    background: "var(--card)",
    boxShadow: "var(--shadow)",
    padding: 14,
  };
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
    createdAt: issue.createdAt,
  };
}

export default function AdminAllIssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadIssues() {
      try {
        const res = await fetch("/api/issues", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load issues");
        }

        const mapped = Array.isArray(data.issues) ? data.issues.map(toUiIssue) : [];

        if (!ignore) {
          setIssues(mapped);
          setMounted(true);
        }
      } catch (error) {
        console.error("[admin/all] load failed:", error);
        if (!ignore) {
          setIssues([]);
          setMounted(true);
        }
      }
    }

    loadIssues();

    function handleWindowFocus() {
      loadIssues();
    }

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      ignore = true;
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const sorted = useMemo(() => {
    return issues.slice();
  }, [issues]);

  if (!mounted) {
    return (
      <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
        <div style={{ color: "var(--muted)" }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "26px auto", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ margin: 0, fontSize: 34, fontWeight: 1000 }}>All issues</h2>
      <p style={{ marginTop: 10, color: "var(--muted)", fontWeight: 700 }}>
        Click any issue to open details.
      </p>

      {sorted.length === 0 ? (
        <div style={{ marginTop: 18, color: "var(--muted)" }}>No issues yet.</div>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {sorted.map((i) => (
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