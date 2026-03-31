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

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <div className="grid gap-3 md:grid-cols-3">
                        <ChoiceCard
                            title="Student"
                            subtitle="Raise issues, comment, vote"
                            img="/illus/student.png"
                            active={picked === "STUDENT"}
                            onClick={() => choose("STUDENT")}
                        />
                        <ChoiceCard
                            title="Admin"
                            subtitle="Review, assign, manage notices"
                            img="/illus/admin.png"
                            active={picked === "ADMIN"}
                            onClick={() => choose("ADMIN")}
                        />
                        <ChoiceCard
                            title="Staff"
                            subtitle="Work queue, resolve issues"
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
                "rounded-2xl border p-5 text-left transition",
                active
                    ? "border-blue-400/30 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-blue-400/25 hover:bg-blue-500/5",
            ].join(" ")}
        >
            <div className="flex items-center gap-4">
                <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                    <Image src={img} alt={title} fill className="object-contain p-3" />
                </div>
                <div className="min-w-0">
                    <div className="text-base font-semibold text-white/90">{title}</div>
                    <div className="mt-1 text-sm text-white/55">{subtitle}</div>
                </div>
            </div>
        </button>
    );
}