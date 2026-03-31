"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  expiresAt: string;
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
    createdAt: notice.createdAt || "",
    expiresAt: notice.expiresAt || "",
  };
}

export default function NoticesPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/notices";

  const { status } = useSession();
  const authed = status === "authenticated";

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadNotices() {
      try {
        const res = await fetch("/api/notices", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load notices");
        }

        if (!ignore) {
          setNotices(Array.isArray(data.notices) ? data.notices.map(toUiNotice) : []);
          setLoaded(true);
        }
      } catch (error) {
        console.error("[public/notices] load failed:", error);
        if (!ignore) {
          setNotices([]);
          setLoaded(true);
        }
      }
    }

    loadNotices();
    return () => {
      ignore = true;
    };
  }, []);

  async function goGoogle() {
    await signIn("google", {
      callbackUrl: `/after-login?next=${encodeURIComponent(next)}`,
    });
  }

  function formatExpiry(expiresAt: string) {
    return expiresAt ? new Date(expiresAt).toLocaleString() : "";
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Notices</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Announcements and maintenance alerts. Public viewing is open.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              href="/issues"
              className="rounded-2xl border border-[var(--border)] bg-black/20 px-4 py-2 text-sm font-extrabold hover:border-[color:rgba(38,198,255,0.35)]"
            >
              All issues
            </Link>

            {authed ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-2xl border border-[color:rgba(38,198,255,0.35)] bg-[color:rgba(38,198,255,0.10)] px-4 py-2 text-sm font-extrabold hover:bg-[color:rgba(38,198,255,0.14)]"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={goGoogle}
                className="rounded-2xl border border-[color:rgba(38,198,255,0.55)] bg-[color:rgba(38,198,255,0.18)] px-4 py-2 text-sm font-extrabold"
              >
                Continue with Google
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {!loaded ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] px-5 py-4 text-sm text-[var(--muted)] font-bold">
              Loading notices...
            </div>
          ) : notices.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] px-5 py-4 text-sm text-[var(--muted)] font-bold">
              No notices right now.
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black">{n.title}</div>
                    <div className="mt-1 text-xs font-bold text-[var(--muted)]">
                      Expires • {formatExpiry(n.expiresAt)}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-[var(--muted)] leading-6">{n.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}