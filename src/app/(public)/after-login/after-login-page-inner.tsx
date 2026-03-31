"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dashboardFor, getStoredRole } from "@/lib/role";

function AfterLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "";
    const safeNext = next.startsWith("/") ? next : "";
    const role = getStoredRole();

    if (!role) {
      const setupTarget = safeNext ? `/setup/role?next=${encodeURIComponent(safeNext)}` : "/setup/role";
      router.replace(setupTarget);
      return;
    }

    if (safeNext) {
      router.replace(safeNext);
      return;
    }

    router.replace(dashboardFor(role));
  }, [sp, router]);

  return <div>Redirecting...</div>;
}

export default function AfterLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AfterLoginInner />
    </Suspense>
  );
}