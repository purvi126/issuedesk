"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getIssues, type Issue } from "@/lib/store";

export default function MyIssuesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    setMounted(true);
    setIssues(getIssues());
  }, []);

  useEffect(() => {
    function handleWindowFocus() {
      setIssues(getIssues());
    }

    function handleStorage() {
      setIssues(getIssues());
    }

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const currentUserId = (session?.user?.email ?? "").trim().toLowerCase();

  const myIssues = useMemo(() => {
    if (!currentUserId) return [];

    return issues.filter(
      (issue) => (issue.createdById ?? "").trim().toLowerCase() === currentUserId
    );
  }, [issues, currentUserId]);

  if (!mounted || status === "loading") return null;

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            My Issues
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Track issues you created.
          </p>
        </div>

        {myIssues.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            No issues found.
          </div>
        ) : (
          <div className="grid gap-3">
            {myIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => router.push(`/issues/${issue.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-blue-400/25 hover:bg-blue-500/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-white/90">
                      {issue.title || "(Untitled)"}
                    </div>
                    <div className="mt-1 text-sm text-white/60">{issue.locationText}</div>
                    <div className="mt-2 text-xs text-white/55">
                      {issue.section} • {issue.category} • {issue.priority} • {issue.status}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}