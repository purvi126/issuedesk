"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Role = "STUDENT" | "ADMIN" | "TECH";

function dashboardFor(role: Role) {
    if (role === "ADMIN") return "/admin/board";
    if (role === "TECH") return "/tech/assigned";
    return "/issues";
}

export default function RolePageInner() {
    const router = useRouter();
    const sp = useSearchParams();
    const next = sp.get("next") || "";

    const [picked, setPicked] = useState<Role | null>(null);

    function choose(role: Role) {
        setPicked(role);
        sessionStorage.setItem("issuedesk_role", role);

        if (next) {
            router.replace(next);
            return;
        }

        router.replace(dashboardFor(role));
    }

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                    Choose role
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-white/60">Select to continue.</p>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ChoiceCard
                            title="Student"
                            subtitle="Browse issues, report problems, track progress"
                            img="/illus/student.png"
                            active={picked === "STUDENT"}
                            onClick={() => choose("STUDENT")}
                        />
                        <ChoiceCard
                            title="Admin"
                            subtitle="Review issues, assign staff, manage notices"
                            img="/illus/admin.png"
                            active={picked === "ADMIN"}
                            onClick={() => choose("ADMIN")}
                        />
                        <ChoiceCard
                            title="Staff"
                            subtitle="Handle assigned issues, update progress, close work"
                            img="/illus/tech.png"
                            active={picked === "TECH"}
                            onClick={() => choose("TECH")}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
function ChoiceCard({
    title,
    subtitle,
    img,
    active,
    onClick,
}: {
    title: string;
    subtitle: string;
    img: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "group h-full rounded-[26px] border p-6 text-left transition-all duration-200",
                active
                    ? "border-cyan-200 bg-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.04),0_10px_30px_rgba(15,23,42,0.08)] dark:border-cyan-400/30 dark:bg-cyan-500/[0.08] dark:shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_10px_30px_rgba(0,0,0,0.18)]"
                    : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/20 dark:hover:bg-white/[0.05]",
            ].join(" ")}
        >
            <div className="flex flex-col items-start">
                <div className="relative mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-inner dark:border-white/10 dark:bg-white/[0.045]">
                    <Image
                        src={img}
                        alt={title}
                        fill
                        className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                    />
                </div>

                <div className="text-[1.5rem] font-semibold leading-none tracking-tight text-slate-900 dark:text-white/95">
                    {title}
                </div>

                <div className="mt-3 max-w-[12ch] text-base leading-7 text-slate-600 dark:text-white/72">
                    {subtitle}
                </div>
            </div>
        </button>
    );
}