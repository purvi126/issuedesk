"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginButton({
  label = "Sign in",
  fallbackTo,
}: {
  label?: string;
  fallbackTo?: string;
}) {
  const sp = useSearchParams();
  const from = sp.get("from");
  const callbackUrl = from || fallbackTo || "/";

  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="w-full rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:opacity-95 dark:border-slate-800 dark:bg-white dark:text-slate-900"
    >
      {label}
    </button>
  );
}