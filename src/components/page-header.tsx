import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">{subtitle}</p>
        ) : null}
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}