"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AfterLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/home";

  useEffect(() => {
    // Always ask role after login
    router.replace(`/setup/role?next=${encodeURIComponent(next)}`);
  }, [router, next]);

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
        Redirecting…
      </div>
    </main>
  );
}