"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewIssuePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/setup/section");
  }, [router]);

  return (
    <main className="min-h-screen px-6 py-6">
      <div className="mx-auto max-w-3xl text-sm text-white/60">
        Redirecting to new issue form...
      </div>
    </main>
  );
}