import AuthShell from "@/components/auth-shell";
import AppSidebar from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell>
      <AppSidebar />
      <main className="min-h-screen md:pl-[300px] pt-16 md:pt-0">{children}</main>
    </AuthShell>
  );
}