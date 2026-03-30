"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Issue = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  section?: string;
  hostelGender?: string;
  hostelName?: string;
  hostelBlock?: string;
  campusBlock?: string;
  roomNumber?: string;
  locationText?: string;
  attachmentName?: string;
  createdByEmail?: string;
  status?: string;
  createdAt?: string;
};

export default function MyIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadIssue() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/issues/${params.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load issue");
        }

        if (!ignore) {
          setIssue(data.issue || null);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        if (!ignore) {
          setError(message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (params?.id) {
      loadIssue();
    }

    return () => {
      ignore = true;
    };
  }, [params?.id]);

  function formatDate(value?: string) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getLocationLabel(issue: Issue) {
    if (issue.section === "Hostel") {
      const parts = [
        issue.hostelGender,
        issue.hostelName ? `Hostel ${issue.hostelName}` : "",
        issue.roomNumber ? `Room ${issue.roomNumber}` : "",
      ].filter(Boolean);

      return parts.join(" • ") || issue.locationText || "Not provided";
    }

    if (issue.section === "Campus") {
      const parts = [
        issue.campusBlock,
        issue.roomNumber ? `Room ${issue.roomNumber}` : "",
      ].filter(Boolean);

      return parts.join(" • ") || issue.locationText || "Not provided";
    }

    return issue.locationText || "Not provided";
  }

  return (
    <div className="space-y-6 p-6 md:p-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Issue Details
          </h1>
          <p className="mt-1 text-sm text-white/55">
            View full information for this issue
          </p>
        </div>

        <Link
          href="/my-issues"
          className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15"
        >
          Back
        </Link>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-cyan-400/15 bg-white/5 p-6 text-sm text-white/70 backdrop-blur-md">
          Loading issue...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-md">
          {error}
        </div>
      ) : !issue ? (
        <div className="rounded-3xl border border-cyan-400/15 bg-white/5 p-6 text-sm text-white/70 backdrop-blur-md">
          Issue not found.
        </div>
      ) : (
        <div className="rounded-[28px] border border-cyan-400/15 bg-white/6 p-6 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {issue.title}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Submitted by {issue.createdByEmail || "Unknown"}
              </p>
            </div>

            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-200">
              {issue.status || "Open"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Category
              </p>
              <p className="mt-2 text-sm text-white/85">
                {issue.category || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Priority
              </p>
              <p className="mt-2 text-sm text-white/85">
                {issue.priority || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Section
              </p>
              <p className="mt-2 text-sm text-white/85">
                {issue.section || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Created
              </p>
              <p className="mt-2 text-sm text-white/85">
                {formatDate(issue.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Location
            </p>
            <p className="mt-2 text-sm text-white/85">
              {getLocationLabel(issue)}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-white/85">
              {issue.description || "No description provided"}
            </p>
          </div>

          {issue.attachmentName ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Attachment
              </p>
              <p className="mt-2 text-sm text-white/85">
                {issue.attachmentName}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}