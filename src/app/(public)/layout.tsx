export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_22%),linear-gradient(180deg,#03111f_0%,#020817_100%)] text-white">
      {children}
    </div>
  );
}