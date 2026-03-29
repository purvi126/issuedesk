"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredRole, type AppRole, ROLE_KEY } from "@/lib/role";

type SidebarLink = {
  label: string;
  href: string;
  locked?: boolean;
};

function getRoleLabel(role: AppRole | null, signedIn: boolean) {
  if (!signedIn || !role) return "public";
  if (role === "ADMIN") return "admin";
  if (role === "TECH") return "staff";
  return "student";
}

function getMainLinks(role: AppRole | null, signedIn: boolean): SidebarLink[] {
  if (!signedIn || !role) {
    return [
      { label: "Issues", href: "/issues" },
      { label: "My Issues", href: "/my-issues", locked: true },
      { label: "Raise Issue", href: "/login", locked: true },
    ];
  }

  if (role === "STUDENT") {
    return [
      { label: "Issues", href: "/issues" },
      { label: "My Issues", href: "/my-issues" },
      { label: "Raise Issue", href: "/issues/new" },
    ];
  }

  if (role === "TECH") {
    return [
      { label: "Staff Queue", href: "/tech/assigned" },
      { label: "All Issues", href: "/issues" },
    ];
  }

  return [
    { label: "Admin Board", href: "/admin/board" },
    { label: "All Issues", href: "/issues" },
  ];
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<AppRole | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedRole = getStoredRole();
    setRole(storedRole);
    setSignedIn(!!storedRole);
  }, [pathname]);

  const roleLabel = useMemo(() => getRoleLabel(role, signedIn), [role, signedIn]);
  const mainLinks = useMemo(() => getMainLinks(role, signedIn), [role, signedIn]);

  function handleSignOut() {
    sessionStorage.removeItem(ROLE_KEY);
    router.replace("/login");
  }

  if (!mounted) return null;

  return (
    <aside className="w-72 border-r border-white/10 bg-transparent p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-2xl font-semibold text-white">IssueDesk</div>
        <div className="text-sm font-medium text-white/60">{roleLabel}</div>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 text-sm font-semibold text-white/70">
            {role === "TECH" ? "Staff" : role === "ADMIN" ? "Admin" : "Browse"}
          </div>

          <div className="space-y-2">
            {mainLinks.map((link) =>
              link.locked ? (
                <div
                  key={link.label}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white/40"
                >
                  {link.label}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`block rounded-2xl border px-4 py-3 text-sm font-medium transition ${pathname === link.href
                      ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-cyan-400/25 hover:bg-cyan-500/5"
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-1 text-sm font-semibold text-white/80">Account</div>
          <div className="mb-4 text-sm text-white/55">
            {signedIn ? "You're signed in." : "Browse publicly."}
          </div>

          {signedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500/15"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="block w-full rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-cyan-500/15"
            >
              Sign in
            </Link>
          )}
        </section>
      </div>
    </aside>
  );
}