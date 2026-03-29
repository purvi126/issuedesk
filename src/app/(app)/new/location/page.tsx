"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Section = "HOSTEL" | "CAMPUS";
type HostelGender = "MEN" | "WOMEN";

const MEN_HOSTELS = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "T",
    "U",
    "V",
];

const WOMEN_HOSTELS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "S"];

const CAMPUS_BLOCKS = [
    "CDMM",
    "Library",
    "GDN",
    "MGR",
    "SMV",
    "TT",
    "SJT",
    "PRP",
    "Gandhi Block",
];

export default function NewIssueLocationPage() {
    const router = useRouter();

    const [section, setSection] = useState<Section | null>(null);
    const [hostelGender, setHostelGender] = useState<HostelGender>("MEN");
    const [hostelName, setHostelName] = useState("");
    const [roomNumber, setRoomNumber] = useState("");
    const [campusBlock, setCampusBlock] = useState("");
    const [campusArea, setCampusArea] = useState("");

    useEffect(() => {
        const raw = localStorage.getItem("issuedesk_draft_step1");

        if (!raw) {
            router.replace("/new");
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            if (parsed.section === "HOSTEL" || parsed.section === "CAMPUS") {
                setSection(parsed.section);
            } else {
                router.replace("/new");
            }
        } catch {
            router.replace("/new");
        }
    }, [router]);

    const hostelOptions = useMemo(() => {
        return hostelGender === "MEN" ? MEN_HOSTELS : WOMEN_HOSTELS;
    }, [hostelGender]);

    const canContinue = useMemo(() => {
        if (section === "HOSTEL") {
            return hostelName.trim() !== "" && roomNumber.trim() !== "";
        }

        if (section === "CAMPUS") {
            return campusBlock.trim() !== "";
        }

        return false;
    }, [section, hostelName, roomNumber, campusBlock]);

    function handleContinue() {
        if (!section || !canContinue) return;

        const raw = localStorage.getItem("issuedesk_draft_step1");
        const existing = raw ? JSON.parse(raw) : {};

        if (section === "HOSTEL") {
            localStorage.setItem(
                "issuedesk_draft_step1",
                JSON.stringify({
                    ...existing,
                    section: "HOSTEL",
                    hostelGender,
                    hostelName,
                    roomNumber: roomNumber.trim(),
                })
            );
        } else {
            localStorage.setItem(
                "issuedesk_draft_step1",
                JSON.stringify({
                    ...existing,
                    section: "CAMPUS",
                    campusBlock,
                    roomNumber: campusArea.trim(),
                })
            );
        }

        router.push("/new/issue");
    }

    if (!section) return null;

    return (
        <main className="min-h-screen px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {section === "HOSTEL" ? "Choose your hostel details" : "Choose your campus location"}
                </h1>

                <p className="mt-2 text-sm text-white/60">
                    {section === "HOSTEL"
                        ? "Select hostel type and hostel name."
                        : "Select the block where the issue is happening."}
                </p>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    {section === "HOSTEL" ? (
                        <>
                            <div className="mb-3 text-sm font-semibold text-white/80">Hostel type *</div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <ChoiceCard
                                    title="Men"
                                    img="/illus/men.png"
                                    selected={hostelGender === "MEN"}
                                    onClick={() => {
                                        setHostelGender("MEN");
                                        setHostelName("");
                                    }}
                                />

                                <ChoiceCard
                                    title="Women"
                                    img="/illus/women.png"
                                    selected={hostelGender === "WOMEN"}
                                    onClick={() => {
                                        setHostelGender("WOMEN");
                                        setHostelName("");
                                    }}
                                />
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Hostel name *
                                </label>

                                <select
                                    value={hostelName}
                                    onChange={(e) => setHostelName(e.target.value)}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none focus:border-cyan-400/40"
                                >
                                    <option value="">-- select hostel --</option>
                                    {hostelOptions.map((name) => (
                                        <option key={name} value={name}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Room number *
                                </label>

                                <input
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                    placeholder="e.g. 204"
                                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Campus block *
                                </label>

                                <select
                                    value={campusBlock}
                                    onChange={(e) => setCampusBlock(e.target.value)}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none focus:border-cyan-400/40"
                                >
                                    <option value="">-- select block --</option>
                                    {CAMPUS_BLOCKS.map((block) => (
                                        <option key={block} value={block}>
                                            {block}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-semibold text-white/80">
                                    Room / area
                                </label>

                                <input
                                    value={campusArea}
                                    onChange={(e) => setCampusArea(e.target.value)}
                                    placeholder="e.g. room 210, 2nd floor"
                                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-cyan-400/40"
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.push("/new")}
                            className="h-12 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!canContinue}
                            className="h-12 flex-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-sm font-semibold text-white transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

function ChoiceCard({
    title,
    img,
    selected,
    onClick,
}: {
    title: string;
    img: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "flex items-center gap-4 rounded-2xl border p-4 text-left transition",
                selected
                    ? "border-cyan-400/30 bg-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/25 hover:bg-cyan-500/5",
            ].join(" ")}
        >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <Image src={img} alt={title} fill className="object-contain p-2" />
            </div>

            <div className="text-base font-semibold text-white/90">{title}</div>
        </button>
    );
}