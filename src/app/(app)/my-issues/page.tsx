"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type UiIssue = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  section: string;
  status: string;
  createdById: string;
  locationText: string;
};

type ApiIssue = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  section?: string;
  status?: string;
  createdByEmail?: string;
  createdById?: string;
  hostelGender?: string;
  hostelName?: string;
  hostelBlock?: string;
  campusBlock?: string;
  roomNumber?: string;
  locationText?: string;
};

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

function toUiIssue(issue: ApiIssue): UiIssue {
  const owner =
    issue.createdByEmail?.trim().toLowerCase() ||
    issue.createdById?.trim().toLowerCase() ||
    "";

  return {
    id: issue._id,
    title: issue.title?.trim() || "(Untitled)",
    description: issue.description?.trim() || "",
    category: issue.category?.trim() || "General",
    priority: issue.priority?.trim() || "Low",
    section: issue.section?.trim() || "Unknown",
    status: issue.status?.trim() || "Open",
    createdById: owner,
    locationText: buildLocationText(issue),
  };
}

export default function MyIssuesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<UiIssue[]>([]);

  useEffect(() => {
    setMounted(true);
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
          ? data.issues.map(toUiIssue)
          : [];

        if (!ignore) {
          setIssues(mapped);
        }
      } catch (error) {
        console.error("[my-issues] load failed:", error);
        if (!ignore) {
          setIssues([]);
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
  }, [mounted]);

  const currentUserId = (session?.user?.email ?? "").trim().toLowerCase();

  const myIssues = useMemo(() => {
    if (!currentUserId) return [];
    return issues.filter(
      (issue) => (issue.createdById ?? "").trim().toLowerCase() === currentUserId
    );
  }, [issues, currentUserId]);

  if (!mounted || status === "loading") return null;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            My Issues
          </h1>
          <p className="mt-1 text-white/60">Track issues you created.</p>
        </div>

        {myIssues.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/75">
            No issues found.
          </div>
        ) : (
          <div className="space-y-4">
            {myIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => router.push(`/issues/${issue.id}`)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-blue-400/25 hover:bg-blue-500/5"
              >
                <div className="text-lg font-semibold text-white">
                  {issue.title || "(Untitled)"}
                </div>

                <div className="mt-1 text-sm text-white/65">
                  {issue.locationText || "Location not provided"}
                </div>

                <div className="mt-2 text-sm text-white/50">
                  {issue.section} • {issue.category} • {issue.priority} • {issue.status}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}