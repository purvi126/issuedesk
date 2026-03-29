type BoardProps = {
  title: string;
  subtitle?: string;
  view: "board" | "list";
  onBoard: () => void;
  onList: () => void;
  actions?: React.ReactNode;
  openIssues: any[];
  inProgressIssues: any[];
  resolvedIssues: any[];
};

export default function IssuesBoard({
  title,
  subtitle,
  view,
  onBoard,
  onList,
  actions,
  openIssues,
  inProgressIssues,
  resolvedIssues,
}: BoardProps) {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <button
              type="button"
              onClick={onBoard}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                view === "board"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              Board
            </button>
            <button
              type="button"
              onClick={onList}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                view === "list"
                  ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* rest of the shared layout */}
      </div>
    </main>
  );
}