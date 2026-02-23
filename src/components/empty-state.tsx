import Image from "next/image";

export default function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto relative h-44 w-44 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <Image src="/illus/empty.png" alt="Empty" fill className="object-contain p-6" />
      </div>

      <div className="mt-4 text-base font-semibold text-white/85">{title}</div>
      {subtitle ? <div className="mt-1 text-sm text-white/60">{subtitle}</div> : null}

      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-5 h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}