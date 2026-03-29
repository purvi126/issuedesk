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
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(8,18,32,0.72)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Recent notices</h2>
                        <p className="mt-1 text-sm text-white/60">
                            Important updates before you continue.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {notices.map((n) => (
                        <div
                            key={n.id}
                            className="rounded-xl border border-white/10 bg-white/[0.05] p-4"
                        >
                            <div className="text-sm font-semibold text-white/90">{n.title}</div>
                            {n.meta ? (
                                <div className="mt-1 text-xs text-white/50">{n.meta}</div>
                            ) : null}
                            <div className="mt-2 text-sm text-white/70">{n.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}