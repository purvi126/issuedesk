"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ROLE_KEY = "issuedesk_role";

function AfterLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "";

    sessionStorage.removeItem(ROLE_KEY);

    if (next && next.startsWith("/")) {
      router.replace(`/setup/role?next=${encodeURIComponent(next)}`);
      return;
    }

    router.replace("/setup/role");
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