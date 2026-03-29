import AppShell from "@/components/app-shell";
import PublicShell from "@/components/public-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <PublicShell>{children}</PublicShell>
    </AppShell>
  );
}