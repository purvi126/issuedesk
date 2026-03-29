"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideSidebar =
    pathname === "/" || pathname === "/login" || pathname === "/after-login";

  if (hideSidebar) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen md:flex">
      <AppSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}