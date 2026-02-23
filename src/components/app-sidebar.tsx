"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {signOut} from "next-auth/react";
type Role = "STUDENT" | "ADMIN" | "TECH";
type NavItem = { label: string; href: string; restricted?: boolean; emphasis?: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const authed = status === "authenticated";

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("issuedesk_role");
    if (r === "STUDENT" || r === "ADMIN" || r === "TECH") setRole(r);
    else setRole(null);
  }, []);

  const roleLinks: NavItem[] = useMemo(() => {
    if (role === "ADMIN")
      return [
        { label: "Board", href: "/admin/board", restricted: true },
        { label: "All Issues", href: "/admin/all", restricted: true },
        { label: "New notice", href: "/admin/notices/new", restricted: true },
      ];
    if (role === "TECH")
      return [
        { label: "Queue", href: "/tech/assigned", restricted: true },
        { label: "Completed", href: "/tech/completed", restricted: true },
      ];

    // STUDENT
    return [
      { label: "Raise Issue", href: "/setup/section", restricted: true, emphasis: true },
    ];
  }, [role]);

  const browseLinks: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "All issues", href: "/issues" },
  { label: "My issues", href: "/recent" },
  ];

  function redirectToLogin(nextHref: string) {
    router.push(`/login?next=${encodeURIComponent(nextHref)}`);
  }

  function onClickItem(item: NavItem) {
    if (item.restricted && !authed) {
      setNotice("Sign in required — redirecting to login…");
      setOpen(false);
      window.setTimeout(() => redirectToLogin(item.href), 650);
      return;
    }
    router.push(item.href);
    setOpen(false);
  }

  const NavBlock = ({ title, items }: { title: string; items: NavItem[] }) => (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
      <div className="px-4 pt-4 pb-2 text-xs font-extrabold tracking-wide text-[var(--muted)]">
        {title}
      </div>
      <div className="px-2 pb-3">
        {items.map((i) => {
          const active = isActive(pathname, i.href);
          const emph = !!i.emphasis;

          return (
            <button
              key={i.href}
              onClick={() => onClickItem(i)}
              className={[
                "w-full text-left px-3 py-2 rounded-xl flex items-center justify-between",
                "transition border",
                active
                  ? "border-[color:rgba(38,198,255,0.55)] bg-[color:rgba(38,198,255,0.16)]"
                  : emph
                    ? "border-[color:rgba(0,255,213,0.18)] bg-[color:rgba(38,198,255,0.10)] hover:border-[color:rgba(38,198,255,0.40)]"
                    : "border-transparent hover:border-[var(--border)] hover:bg-[color:rgba(255,255,255,0.04)]",
              ].join(" ")}
            >
              <span
                className={[
                  "text-sm",
                  emph ? "font-black text-[color:rgba(180,245,255,0.95)]" : "font-extrabold",
                ].join(" ")}
              >
                {i.label}
              </span>

              {i.restricted && !authed ? (
                <span className="text-[10px] font-black text-[var(--muted)]">LOCK</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {notice ? (
        <div className="fixed top-4 left-1/2 z-[60] -translate-x-1/2 px-4">
          <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg">
            {notice}
          </div>
        </div>
      ) : null}

      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="h-11 w-11 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1">
            <span className="block h-[2px] w-5 bg-[var(--text)] opacity-80" />
            <span className="block h-[2px] w-5 bg-[var(--text)] opacity-80" />
            <span className="block h-[2px] w-5 bg-[var(--text)] opacity-80" />
          </div>
        </button>
      </div>

      <aside className="hidden md:block fixed left-0 top-0 h-full w-[280px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight">
            IssueDesk
          </Link>
          <span className="text-xs font-extrabold text-[var(--muted)]">
            {role === "TECH" ? "staff" : role ? role.toLowerCase() : "public"}
          </span>
        </div>

        <div className="space-y-4">
          <NavBlock title="Browse" items={browseLinks} />
          <NavBlock title="Role links" items={roleLinks} />

          {!authed ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
              <div className="text-sm font-extrabold">Actions need sign-in</div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                To create, vote, comment, or manage, sign in first.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="mt-3 w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2 font-extrabold hover:bg-blue-500/15"
              >
                Go to login
              </button>
            </div>
          ) : null}
          {authed ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4">
              <div className="text-sm font-extrabold">Account</div>
              <p className="mt-1 text-sm text-[var(--muted)]">You’re signed in.</p>
              <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="mt-3 w-full rounded-xl border border-[color:rgba(38,198,255,0.35)] bg-[color:rgba(38,198,255,0.10)] px-3 py-2 font-extrabold hover:bg-[color:rgba(38,198,255,0.14)]"
              >
              Sign out
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] p-5">
            <div className="h-full rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-lg font-black">IssueDesk</div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 font-extrabold hover:bg-white/5"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <NavBlock title="Browse" items={browseLinks} />
                <NavBlock title="Role links" items={roleLinks} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}