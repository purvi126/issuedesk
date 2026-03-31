"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  addComment,
  getIssue,
  getScore,
  toggleUpvote,
  type Issue,
} from "@/lib/store";

type ApiIssue = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  section?: string;
  status?: string;
  createdByEmail?: string;
  hostelGender?: string;
  hostelName?: string;
  hostelBlock?: string;
  campusBlock?: string;
  roomNumber?: string;
  locationText?: string;
  attachmentName?: string;
  createdAt?: string;
  comments?: {
    id?: string;
    text?: string;
    createdAt?: number;
  }[];
};

type DetailComment = {
  id: string;
  text: string;
  createdAt: number;
};

type DetailIssue = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MED" | "HIGH";
  section: "HOSTEL" | "CAMPUS";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdById: string;
  locationText: string;
  attachmentDataUrl?: string;
  createdAt?: number;
  comments: DetailComment[];
};

function buildLocationText(issue: ApiIssue) {
  if (issue.locationText?.trim()) return issue.locationText.trim();

  const section = issue.section?.trim().toUpperCase();

  if (section === "HOSTEL") {
    const block = issue.hostelBlock?.trim() || issue.hostelName?.trim() || "";
    const parts = [
      issue.hostelGender?.trim(),
      block ? `Block ${block}` : "",
      issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }

  if (section === "CAMPUS") {
    const parts = [
      issue.campusBlock?.trim(),
      issue.roomNumber?.trim() ? `Room ${issue.roomNumber.trim()}` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }

  return "";
}

function normalizeStoreIssue(issue: Issue): DetailIssue {
  return {
    id: issue.id,
    title: issue.title || "(Untitled)",
    description: issue.description || "",
    category: issue.category || "General",
    priority: issue.priority,
    section: issue.section,
    status: issue.status,
    createdById: issue.createdById || "",
    locationText: issue.locationText || "",
    attachmentDataUrl: issue.attachmentDataUrl || "",
    createdAt: typeof issue.createdAt === "number" ? issue.createdAt : Date.now(),
    comments: Array.isArray(issue.comments)
      ? issue.comments.map((c) => ({
          id: c.id,
          text: c.text,
          createdAt: c.createdAt,
        }))
      : [],
  };
}

function toUiIssue(issue: ApiIssue): DetailIssue {
  const createdAt =
    issue.createdAt && !Number.isNaN(new Date(issue.createdAt).getTime())
      ? new Date(issue.createdAt).getTime()
      : Date.now();

  const priority = (issue.priority?.trim().toUpperCase() || "LOW") as
    | "LOW"
    | "MED"
    | "HIGH";

  const section = (issue.section?.trim().toUpperCase() || "HOSTEL") as
    | "HOSTEL"
    | "CAMPUS";

  const status = (issue.status?.trim().toUpperCase() || "OPEN") as
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED";

  return {
    id: issue._id,
    title: issue.title?.trim() || "(Untitled)",
    description: issue.description?.trim() || "",
    category: issue.category?.trim() || "General",
    priority,
    section,
    status,
    createdById: issue.createdByEmail?.trim() || "",
    locationText: buildLocationText(issue),
    attachmentDataUrl: issue.attachmentName?.trim()
      ? issue.attachmentName.trim()
      : "",
    createdAt,
    comments: Array.isArray(issue.comments)
      ? issue.comments.map((c, index) => ({
          id: c.id || `${issue._id}-comment-${index}`,
          text: c.text?.trim() || "",
          createdAt:
            typeof c.createdAt === "number" ? c.createdAt : Date.now(),
        }))
      : [],
  };
}

export default function IssueDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [issue, setIssue] = useState<DetailIssue | null>(null);
  const [storeIssue, setStoreIssue] = useState<Issue | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isMongoIssue, setIsMongoIssue] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !params?.id) return;

    let ignore = false;

    async function loadIssue() {
      try {
        const localIssue = getIssue(params.id);

        if (localIssue) {
          if (!ignore) {
            setStoreIssue(localIssue);
            setIssue(normalizeStoreIssue(localIssue));
            setIsMongoIssue(false);
          }
          return;
        }

        const res = await fetch(`/api/issues/${params.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Issue not found");
        }

        if (!ignore) {
          setStoreIssue(null);
          setIssue(toUiIssue(data.issue));
          setIsMongoIssue(true);
        }
      } catch (error) {
        console.error("[issue details] load failed:", error);
        if (!ignore) {
          setStoreIssue(null);
          setIssue(null);
          setIsMongoIssue(false);
        }
      }
    }

    loadIssue();

    return () => {
      ignore = true;
    };
  }, [mounted, params?.id]);

  const score = useMemo(() => {
    if (!issue) return 0;
    if (isMongoIssue) return issue.comments.length;
    return storeIssue ? getScore(storeIssue) : 0;
  }, [issue, isMongoIssue, storeIssue]);

  function handleUpvote() {
    if (!issue || isMongoIssue) return;

    toggleUpvote(issue.id, "student@vit.ac.in");

    const updated = getIssue(issue.id);
    if (updated) {
      setStoreIssue(updated);
      setIssue(normalizeStoreIssue(updated));
    }
  }

  async function handleAddComment() {
    if (!issue) return;

    const text = commentText.trim();
    if (!text) return;

    if (isMongoIssue) {
      try {
        setPostingComment(true);

        const res = await fetch(`/api/issues/${issue.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ commentText: text }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to post comment");
        }

        setIssue(toUiIssue(data.issue));
        setCommentText("");
      } catch (error) {
        console.error("[issue details] comment failed:", error);
        alert(error instanceof Error ? error.message : "Failed to post comment");
      } finally {
        setPostingComment(false);
      }
      return;
    }

    addComment(issue.id, text);

    const updated = getIssue(issue.id);
    if (updated) {
      setStoreIssue(updated);
      setIssue(normalizeStoreIssue(updated));
    }

    setCommentText("");
  }

  if (!mounted) return null;

  if (!issue) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="mb-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-blue-400/30 hover:bg-blue-500/10"
          >
            ← Back
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/70">
            Issue not found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/issues")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:border-blue-400/30 hover:bg-blue-500/10"
          >
            ← Back to issues
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-blue-200">
              {issue.priority} • {issue.status} • Score {score}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-white/60">
              ID {issue.id}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {issue.title}
              </h1>

              <p className="mt-2 text-white/70">
                {issue.locationText || "Location not provided"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
                  {issue.section}
                </span>
                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
                  {issue.category}
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={handleUpvote}
                disabled={isMongoIssue}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:border-blue-400/30 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ▲ Upvote
              </button>
              <div className="mt-3 text-4xl font-semibold text-white">{score}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-white/70">Description</div>
            <p className="mt-2 whitespace-pre-wrap text-white/85">
              {issue.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-xl font-semibold text-white">Comments</div>

          <div className="mt-4 space-y-3">
            {issue.comments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/60">
                No comments yet.
              </div>
            ) : (
              issue.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="text-sm text-white/75">{c.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={postingComment}
                className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {postingComment ? "Posting..." : "Post comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}