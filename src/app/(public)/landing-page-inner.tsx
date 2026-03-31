"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function LandingPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { status } = useSession();
  const authed = status === "authenticated";

  const next = sp.get("next");
  const callbackUrl =
    next && next.startsWith("/")
      ? `/after-login?next=${encodeURIComponent(next)}`
      : "/after-login";

  async function goGoogle() {
    await signIn("google", { callbackUrl });
  }

  return (
    <main className="min-h-[calc(100vh-1px)] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
        <section>
          <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wide text-white/55">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[color:rgba(38,198,255,0.95)] shadow-[0_0_28px_rgba(38,198,255,0.55)]" />
            <span>IssueDesk</span>
          </div>

          <h1 className="mt-5 text-5xl sm:text-6xl font-semibold tracking-tight text-white">
            IssueDesk{" "}
            <br></br>
            <span className="font-semibold text-white/55">campus issue tracker</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
            Raise issues, track progress, and get closure — with public browsing and
            sign-in required for actions like creating, voting, and commenting.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <FeatureCard title="Track every issue" body="Clear status, timeline, and history — no lost complaints." />
            <FeatureCard title="Upvotes & sorting" body="Bring urgent issues to the top with sorting by popularity." />
            <FeatureCard title="Role dashboards" body="Students, Staff, Admin — each sees the right workspace." />
            <FeatureCard title="Controlled actions" body="Public viewing is open. Creating and voting require sign-in." />
          </div>
        </section>

        <aside className="w-full">
          <div className="rounded-3xl border border-[color:rgba(38,198,255,0.35)] bg-[linear-gradient(135deg,rgba(38,198,255,0.10),rgba(0,0,0,0))] p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-lg font-black text-white/90">
                  {authed ? "Account" : "Sign in"}
                </div>
                <div className="mt-1 text-sm text-white/60">
                  {authed ? "You are signed in." : "Continue to your dashboard."}
                </div>
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
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
                    className="group flex w-full items-center justify-between rounded-2xl border border-[color:rgba(38,198,255,0.55)] bg-[color:rgba(38,198,255,0.18)] px-5 py-4 text-left transition hover:bg-[color:rgba(38,198,255,0.22)]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Sign in with Google</div>
                      <div className="mt-1 text-xs text-white/55">Recommended</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <span className="text-white/80">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/issues")}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:border-[color:rgba(38,198,255,0.25)] hover:bg-blue-500/5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white/90">Browse publicly</div>
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

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[color:rgba(38,198,255,0.14)] bg-[color:rgba(255,255,255,0.02)] p-4">
      <div className="text-sm font-semibold text-white/85">{title}</div>
      <div className="mt-1 text-sm text-white/60">{body}</div>
    </div>
  );
}