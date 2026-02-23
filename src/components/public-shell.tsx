"use client";

import { usePathname } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // hide sidebar on entry pages
  const hideSidebar =
    pathname === "/" || pathname === "/login" || pathname === "/after-login";

  return (
    <>
      {!hideSidebar ? <AppSidebar /> : null}
      <main className={hideSidebar ? "min-h-screen" : "min-h-screen pt-16 md:pl-[300px] md:pt-0"}>
        {children}
      </main>
    </>
  );
}