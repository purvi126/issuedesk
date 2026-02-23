"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  addComment,
  getIssue,
  getScore,
  hasUpvoted,
  toggleUpvote,
} from "@/lib/store";

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: session } = useSession();
  const userId = (session?.user?.email ?? "") as string;

  const [tick, setTick] = useState(0);
  const [text, setText] = useState("");

  const issue = useMemo(() => {
    if (!id) return undefined;
    return getIssue(id);
  }, [id, tick]);

  function requireSignIn(nextPath: string) {
    router.push(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  function onUpvote() {
    if (!issue) return;
    if (!userId) return requireSignIn(`/issues/${issue.id}`);
    toggleUpvote(issue.id, userId);
    setTick((t) => t + 1);
  }

  function submitComment() {
    const v = text.trim();
    if (!issue || !v) return;
    if (!userId) return requireSignIn(`/issues/${issue.id}`);
    addComment(issue.id, v);
    setText("");
    setTick((t) => t + 1);
  }

  if (!issue) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => router.push("/issues")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
          >
            ← Back
          </button>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
            Issue not found.
          </div>
        </div>
      </main>
    );
  }

  const up = userId ? hasUpvoted(issue, userId) : false;
  const score = getScore(issue);

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push("/issues")}
            className="w-fit rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
          >
            ← Back to issues
          </button>

          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-2 py-1 font-semibold text-blue-100">
              {issue.priority} • {issue.status} • Score {score}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
              ID {issue.id}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">
                {issue.title || "(Untitled)"}
              </h1>
              <p className="mt-1 text-sm text-white/60">{issue.locationText}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                  {issue.section}
                </span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">
                  {issue.category}
                </span>
              </div>

              <div className="mt-5">
                <div className="text-xs font-semibold text-white/60">Description</div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
                  {issue.description || "—"}
                </p>
              </div>

              {issue.attachmentDataUrl ? (
                <div className="mt-6">
                  <div className="text-xs font-semibold text-white/60">Attachment</div>
                  <img
                    src={issue.attachmentDataUrl}
                    alt={issue.attachmentName || "Attachment"}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02]"
                  />
                </div>
              ) : null}
            </div>

            {/* voting */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-stretch">
              <button
                onClick={onUpvote}
                className={[
                  "h-10 rounded-xl border px-4 text-sm font-semibold transition",
                  up
                    ? "border-blue-400/40 bg-blue-500/15 text-blue-100"
                    : "border-white/10 bg-white/5 text-white/80 hover:border-blue-400/30 hover:bg-blue-500/10",
                ].join(" ")}
              >
                ▲ Upvote
              </button>

              <div className="min-w-[72px] text-center text-xl font-semibold text-white/90 sm:py-1">
                {score}
              </div>

              
              {!userId ? (
                <div className="mt-2 hidden text-center text-xs text-white/50 sm:block">
                  Sign in to vote
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* comments */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white/80">Comments</h2>

          <div className="mt-4 grid gap-3">
            {issue.comments.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
                No comments yet.
              </div>
            ) : (
              issue.comments
                .slice()
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="text-xs text-white/45">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white/75">
                      {c.text}
                    </p>
                  </div>
                ))
            )}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            {!userId ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-white/60">
                  Sign in to add a comment.
                </div>
                <button
                  onClick={() => requireSignIn(`/issues/${issue.id}`)}
                  className="h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                >
                  Go to login
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment…"
                  className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex justify-end">
                  <button
                    onClick={submitComment}
                    className="h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
                  >
                    Post comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}