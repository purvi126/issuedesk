export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(38,198,255,0.30)_0,transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-30 bg-[radial-gradient(circle_at_center,var(--accent),transparent_60%)]" />
        <div className="absolute -bottom-44 -left-44 h-[520px] w-[520px] rounded-full blur-3xl opacity-20 bg-[radial-gradient(circle_at_center,var(--accent2),transparent_60%)]" />
      </div>

      {/* content */}
      <div className="relative">{children}</div>
    </div>
  );
}