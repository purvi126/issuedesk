"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AfterLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/home";

    // basic safety: only allow internal paths
    const safe = next.startsWith("/") ? next : "/home";

    router.replace(safe);
  }, [sp, router]);

  return (
    <main style={{ padding: 24 }}>
      <p>Redirecting...</p>
    </main>
  );
}

export default function AfterLoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}><p>Loading...</p></main>}>
      <AfterLoginInner />
    </Suspense>
  );
}