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
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">
                    Choose role
                </h1>
                <p className="mt-2 text-sm text-white/60">Tap one to continue.</p>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
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
                "group h-full rounded-2xl border p-5 text-left transition-all duration-200",
                active
                    ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                    : "border-white/10 bg-white/[0.03] hover:border-cyan-400/20 hover:bg-white/[0.05]",
            ].join(" ")}
        >
            <div className="flex flex-col items-start">
                <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Image src={img} alt={title} fill className="object-contain p-2.5" />
                </div>

                <div className="text-lg font-semibold text-white/95">{title}</div>
                <div className="mt-1.5 text-sm leading-6 text-white/65">
                    {subtitle}
                </div>
            </div>
        </button>
    );
}