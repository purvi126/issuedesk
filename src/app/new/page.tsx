"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Section = "HOSTEL" | "CAMPUS";
type HostelGender = "MEN" | "WOMEN" | "";

const BLOCKS = Array.from({ length: 20 }, (_, i) => String.fromCharCode("A".charCodeAt(0) + i));

export default function NewIssueSettingsPage() {
    const router = useRouter();

    const [section, setSection] = useState<Section>("HOSTEL");
    const [hostelGender, setHostelGender] = useState<HostelGender>("MEN");
    const [block, setBlock] = useState<string>("");
    const [roomNumber, setRoomNumber] = useState<string>("");

    const isHostel = section === "HOSTEL";

    const canContinue = useMemo(() => {
        if (isHostel) {
            return hostelGender !== "" && block.trim().length > 0 && roomNumber.trim().length > 0;
        }
        return true;
    }, [isHostel, hostelGender, block, roomNumber]);

    function saveAndContinue() {
        if (!canContinue) return;

        const draft = {
            section,
            hostelGender: isHostel ? hostelGender : null,
            block: isHostel ? block : null,
            roomNumber: isHostel ? roomNumber.trim() : "",
        };

        localStorage.setItem("issuedesk_draft_step1", JSON.stringify(draft));
        router.push("/new/issue");
    }

    return (
        <div style={{ minHeight: "100vh", background: "white" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>
                <h1 style={{ fontSize: 44, fontWeight: 800, textAlign: "center" }}>
                    First, we need to gather your <span style={{ color: "#55B6D8" }}>information</span>
                </h1>

                <div style={{ height: 36 }} />

                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                    <label style={{ fontWeight: 700, fontSize: 18 }}>Section*</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 12 }}>
                        <CardChoice title="Hostel" selected={section === "HOSTEL"} onClick={() => setSection("HOSTEL")} />
                        <CardChoice title="Campus" selected={section === "CAMPUS"} onClick={() => setSection("CAMPUS")} />
                    </div>

                    <div style={{ height: 26 }} />

                    {isHostel && (
                        <>
                            <label style={{ fontWeight: 700, fontSize: 18 }}>Hostel type*</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 12 }}>
                                <CardChoice title="Men" selected={hostelGender === "MEN"} onClick={() => setHostelGender("MEN")} />
                                <CardChoice
                                    title="Women"
                                    selected={hostelGender === "WOMEN"}
                                    onClick={() => setHostelGender("WOMEN")}
                                />
                            </div>

                            <div style={{ height: 26 }} />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                                <div>
                                    <label style={{ fontWeight: 700, fontSize: 18 }}>Block*</label>
                                    <select value={block} onChange={(e) => setBlock(e.target.value)} style={inputStyle}>
                                        <option value="" disabled>
                                            --select--
                                        </option>
                                        {BLOCKS.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontWeight: 700, fontSize: 18 }}>Room number*</label>
                                    <input
                                        value={roomNumber}
                                        onChange={(e) => setRoomNumber(e.target.value)}
                                        placeholder="e.g., 204"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {!isHostel && <p style={{ marginTop: 14, color: "#555" }}>Campus selected — no hostel gender, block, or room needed.</p>}

                    <div style={{ height: 30 }} />

                    <button
                        onClick={saveAndContinue}
                        disabled={!canContinue}
                        style={{
                            width: "100%",
                            borderRadius: 12,
                            padding: "14px 16px",
                            fontWeight: 800,
                            fontSize: 16,
                            border: "1px solid #111",
                            background: canContinue ? "#111" : "#e5e5e5",
                            color: canContinue ? "white" : "#777",
                            cursor: canContinue ? "pointer" : "not-allowed",
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

function CardChoice({ title, selected, onClick }: { title: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                borderRadius: 14,
                border: selected ? "2px solid #55B6D8" : "1px solid #ddd",
                padding: "22px 16px",
                background: "white",
                cursor: "pointer",
                boxShadow: selected ? "0 0 0 4px rgba(85,182,216,0.15)" : "none",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
        </button>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 10,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "12px 14px",
    fontSize: 16,
    outline: "none",
};
