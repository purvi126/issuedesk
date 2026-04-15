"use client";

type Notice = {
    id: string;
    title: string;
    body: string;
    meta?: string;
};

export default function NoticesPopup({
    open,
    notices,
    onClose,
}: {
    open: boolean;
    notices: Notice[];
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 backdrop-blur-[2px] px-4 pt-20">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[rgba(8,18,32,0.72)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent notices</h2>
                        <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                            Important updates before you continue.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {notices.map((n) => (
                        <div
                            key={n.id}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.05]"
                        >
                            <div className="text-sm font-semibold text-slate-900 dark:text-white/90">{n.title}</div>
                            {n.meta ? (
                                <div className="mt-1 text-xs text-slate-500 dark:text-white/50">{n.meta}</div>
                            ) : null}
                            <div className="mt-2 text-sm text-slate-600 dark:text-white/70">{n.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}