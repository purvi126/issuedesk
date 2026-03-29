"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AfterLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/issues";
    const safe = next.startsWith("/") ? next : "/issues";

    sessionStorage.removeItem("issuedesk_role");
    router.replace(`/setup/role?next=${encodeURIComponent(safe)}`);
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