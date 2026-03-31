"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/lib/role";

type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  expiresAt: number;
};

type ApiNotice = {
  _id: string;
  title?: string;
  body?: string;
  createdAt?: string;
  expiresAt?: string;
};

function toUiNotice(notice: ApiNotice): Notice {
  return {
    id: notice._id,
    title: notice.title?.trim() || "(Untitled)",
    body: notice.body?.trim() || "",
    createdAt: notice.createdAt ? new Date(notice.createdAt).getTime() : 0,
    expiresAt: notice.expiresAt ? new Date(notice.expiresAt).getTime() : 0,
  };
}

export default function AdminNoticesPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [saving, setSaving] = useState(false);

  async function refreshNotices() {
    try {
      const res = await fetch("/api/notices", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load notices");
      }

      const mapped = Array.isArray(data.notices)
        ? data.notices.map(toUiNotice)
        : [];

      setNotices(mapped);
    } catch (error) {
      console.error("[admin/notices] load failed:", error);
      setNotices([]);
    }
  }

  useEffect(() => {
    const role = getStoredRole();

    if (role !== "ADMIN") {
      router.replace("/setup/role");
      return;
    }

    refreshNotices().finally(() => setReady(true));
  }, [router]);

  async function handleAddNotice() {
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    const hours = Number(durationHours);

    if (!cleanTitle || !cleanBody) return;
    if (!Number.isFinite(hours) || hours <= 0) return;

    try {
      setSaving(true);

      const res = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: cleanTitle,
          body: cleanBody,
          durationHours: hours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add notice");
      }

      setTitle("");
      setBody("");
      setDurationHours("24");
      await refreshNotices();
    } catch (error) {
      console.error("[admin/notices] add failed:", error);
      alert(error instanceof Error ? error.message : "Failed to add notice");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNotice(id: string) {
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete notice");
      }

      await refreshNotices();
    } catch (error) {
      console.error("[admin/notices] delete failed:", error);
      alert(error instanceof Error ? error.message : "Failed to delete notice");
    }
  }

  const activeNotices = useMemo(() => {
    const now = Date.now();
    return notices.filter((n) => n.expiresAt > now);
  }, [notices]);

  const expiredNotices = useMemo(() => {
    const now = Date.now();
    return notices.filter((n) => n.expiresAt <= now);
  }, [notices]);

  function formatExpiry(expiresAt: number) {
    return new Date(expiresAt).toLocaleString();
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Notices
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Create notices for students. Notices expire automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-4">
            <div>
              <div className="mb-2 text-sm font-semibold text-white/70">Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Water supply maintenance"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-cyan-400/40"
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold text-white/70">Body</div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Block C water will be shut down from 2 PM to 4 PM."
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-cyan-400/40"
              />
            </div>

            <div className="max-w-xs">
              <div className="mb-2 text-sm font-semibold text-white/70">Expiry</div>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-cyan-400/40"
              >
                <option value="24">24 hours</option>
                <option value="72">3 days</option>
                <option value="168">7 days</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddNotice}
                disabled={saving}
                className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add notice"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white/90">Active notices</h2>
          </div>

          {activeNotices.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
              No active notices.
            </div>
          ) : (
            <div className="grid gap-3">
              {activeNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white/90">
                        {notice.title}
                      </div>
                      <div className="mt-2 text-sm text-white/70">{notice.body}</div>
                      <div className="mt-3 text-xs text-white/50">
                        Expires: {formatExpiry(notice.expiresAt)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {expiredNotices.length > 0 ? (
          <div className="mt-8">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-white/90">Expired notices</h2>
            </div>

            <div className="grid gap-3">
              {expiredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 opacity-70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-white/80">
                        {notice.title}
                      </div>
                      <div className="mt-2 text-sm text-white/60">{notice.body}</div>
                      <div className="mt-3 text-xs text-white/45">
                        Expired: {formatExpiry(notice.expiresAt)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}