"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const sp = useSearchParams();
    const next = sp.get("next") || "/";

    return (
        <div className="min-h-[calc(100vh-1px)] px-6 py-10 flex items-center justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
                {/* Left */}
                <div>

                    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white/90">
                        IssueDesk{" "}
                        <br></br><span className="font-semibold text-white/55">campus issue tracker</span>
                    </h1>

                    <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--muted)]">
                        View all issues publicly. Sign in to create issues, vote, comment, and access role dashboards.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href="/issues"
                            className="rounded-2xl border border-[var(--border)] bg-black/20 px-4 py-3 text-sm font-extrabold hover:border-[color:rgba(80,200,255,0.40)] hover:bg-[color:rgba(80,200,255,0.06)] transition"
                        >
                            Browse public issues
                        </Link>

                        <Link
                            href="/"
                            className="rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm font-extrabold hover:bg-black/20 transition"
                        >
                            Back to home
                        </Link>
                    </div>

                    <div className="mt-8 text-xs font-bold text-[var(--muted)]">
                        Tip: Restricted pages will send you here automatically.
                    </div>
                </div>

                {/* Right card */}
                <div className="rounded-3xl border border-[color:rgba(80,200,255,0.40)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden">
                    {/* header strip */}
                    <div className="px-6 pt-6 pb-4 bg-[linear-gradient(135deg,rgba(80,200,255,0.20),rgba(0,0,0,0))] border-b border-[color:rgba(80,200,255,0.18)]">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <div className="text-lg font-black">Sign in</div>
                                <div className="mt-1 text-sm text-[var(--muted)]">Continue to your dashboard.</div>
                            </div>
                            <div className="h-10 w-10 rounded-2xl border border-[color:rgba(80,200,255,0.35)] bg-[color:rgba(80,200,255,0.12)] shadow-[0_0_30px_rgba(80,200,255,0.25)]" />
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Primary action */}
                        <button
                            onClick={() => signIn("google", { callbackUrl: `/after-login?next=${encodeURIComponent(next)}`, })}
                            className="w-full rounded-2xl border border-[color:rgba(80,200,255,0.75)]
                         bg-[linear-gradient(135deg,rgba(80,200,255,0.28),rgba(80,200,255,0.10))]
                         px-4 py-4 text-left shadow-[0_18px_60px_rgba(80,200,255,0.12)]
                         hover:bg-[linear-gradient(135deg,rgba(80,200,255,0.34),rgba(80,200,255,0.12))]
                         transition"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm font-black">Continue with Google</div>
                                    <div className="mt-1 text-xs font-bold text-[var(--muted)]">Recommended</div>
                                </div>

                                <div
                                    className="h-10 w-10 rounded-2xl border border-[color:rgba(80,200,255,0.55)]
                             bg-[color:rgba(0,0,0,0.25)] flex items-center justify-center
                             text-lg font-black shadow-[0_0_24px_rgba(80,200,255,0.18)]"
                                >
                                    →
                                </div>
                            </div>
                        </button>

                        {/* Secondary action */}
                        <Link
                            href="/issues"
                            className="mt-4 block w-full rounded-2xl border border-[var(--border)] bg-black/20 px-4 py-3
                         text-sm font-extrabold hover:border-[color:rgba(80,200,255,0.40)]
                         hover:bg-[color:rgba(80,200,255,0.06)] transition"
                        >
                            All issues (public)
                        </Link>


                    </div>
                </div>
            </div>
        </div>
    );
}