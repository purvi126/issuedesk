"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function InsideHomePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { status } = useSession();
  const authed = status === "authenticated";
  const next = sp.get("next") || "/recent";

  async function goGoogle() {
    await signIn("google", {
      callbackUrl: `/after-login?next=${encodeURIComponent(next)}`,
    });
  }

  const demoNotices = [
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

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2">
        {/* Left: Notices */}
        <section className="space-y-6">
          <div className="text-sm font-semibold text-white/60">Home</div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            IssueDesk{" "}
            <br></br>
            <span className="font-semibold text-white/55">campus issue tracker</span>
          </h1>

          <div className="rounded-3xl border border-[color:rgba(38,198,255,0.28)] bg-[linear-gradient(135deg,rgba(38,198,255,0.08),rgba(0,0,0,0))] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">Notices</div>
                <div className="mt-1 text-xs text-white/55">
                  Announcements and maintenance alerts.
                </div>
              </div>
              <button
                onClick={() => router.push("/notices")}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:border-[color:rgba(38,198,255,0.25)] hover:bg-blue-500/5"
              >
                View all
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {demoNotices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white/90">{n.title}</div>
                      <div className="mt-1 text-xs text-white/55">
                        {n.tag} • {n.when}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-[color:rgba(38,198,255,0.9)]">
                      {n.id}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-white/60 leading-6">{n.body}</p>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Right: Account / Sign in */}
        <aside className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl border border-[color:rgba(38,198,255,0.35)] bg-[linear-gradient(135deg,rgba(38,198,255,0.10),rgba(0,0,0,0))] p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white/90">
                  {authed ? "Account" : "Sign in"}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {authed ? "You are signed in." : "Continue to your dashboard."}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl border border-[color:rgba(38,198,255,0.35)] bg-[color:rgba(38,198,255,0.10)] shadow-[0_0_40px_rgba(38,198,255,0.18)]" />
            </div>

            <div className="mt-5 grid gap-3">
              {authed ? (
                <>
                  <Link
                    href="/after-login"
                    className="group flex w-full items-center justify-between rounded-2xl border border-[color:rgba(0,255,213,0.22)] bg-[linear-gradient(135deg,rgba(0,255,213,0.10),rgba(38,198,255,0.10))] px-5 py-4 text-left transition hover:border-[color:rgba(0,255,213,0.35)]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Dashboard</div>
                      <div className="mt-1 text-xs text-white/55">See my issues</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition group-hover:border-[color:rgba(38,198,255,0.35)] group-hover:bg-blue-500/10">
                      <span className="text-white/80">→</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => router.push("/setup/section")}
                    className="group flex w-full items-center justify-between rounded-2xl border border-[color:rgba(38,198,255,0.25)] bg-blue-500/10 px-5 py-4 text-left transition hover:bg-blue-500/15"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Raise issue</div>
                      <div className="mt-1 text-xs text-white/55">Hostel or campus</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition group-hover:border-[color:rgba(38,198,255,0.35)] group-hover:bg-blue-500/10">
                      <span className="text-white/80">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-[color:rgba(38,198,255,0.25)] hover:bg-blue-500/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Sign out</div>
                      <div className="mt-1 text-xs text-white/55">End this session</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <span className="text-white/60">⟶</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={goGoogle}
                    className="group flex w-full items-center justify-between rounded-2xl border border-[color:rgba(38,198,255,0.35)] bg-blue-500/12 px-5 py-4 text-left transition hover:bg-blue-500/16"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Continue with Google</div>
                      <div className="mt-1 text-xs text-white/55">Recommended</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition group-hover:border-[color:rgba(38,198,255,0.35)] group-hover:bg-blue-500/10">
                      <span className="text-white/80">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/issues")}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-[color:rgba(38,198,255,0.25)] hover:bg-blue-500/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Continue browsing</div>
                      <div className="mt-1 text-xs text-white/55">View issues and notices</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <span className="text-white/80">→</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}