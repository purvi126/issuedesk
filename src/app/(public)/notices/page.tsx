"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NoticesPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/notices";

  const { status } = useSession();
  const authed = status === "authenticated";

  const demo = [
    {
      id: "N-001",
      title: "Water supply maintenance",
      body: "Block C will have a scheduled water shutdown from 2:00 PM – 4:00 PM today.",
      tag: "Maintenance",
      when: "Today",
    },
    {
      id: "N-002",
      title: "Internet downtime",
      body: "Wi-Fi may be unstable near Library due to router replacement.",
      tag: "Network",
      when: "This week",
    },
  ];

  async function goGoogle() {
    await signIn("google", {
      callbackUrl: `/after-login?next=${encodeURIComponent(next)}`,
    });
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
          {demo.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black">{n.title}</div>
                  <div className="mt-1 text-xs font-bold text-[var(--muted)]">
                    {n.tag} • {n.when}
                  </div>
                </div>
                <div className="text-xs font-black text-[color:rgba(38,198,255,0.9)]">
                  {n.id}
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)] leading-6">{n.body}</p>
            </div>
          ))}

          {demo.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] px-5 py-4 text-sm text-[var(--muted)] font-bold">
              No notices right now.
            </div>
          ) : null}
        </div>

        <div className="mt-8 text-xs font-bold text-[var(--muted)]">
          Tip: Admins will later create notices from their dashboard.
        </div>
      </div>
    </div>
  );
}