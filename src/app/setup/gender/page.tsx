"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenderPage() {
    const router = useRouter();
    const [hover, setHover] = useState<"MEN" | "WOMEN" | null>(null);

    const baseBtn: React.CSSProperties = {
        padding: 22,
        borderRadius: 14,
        border: "1px solid #ddd",
        background: "#fff",
        fontWeight: 900,
        cursor: "pointer",
        transition: "border-color 120ms ease",
    };

    const hoverBtn: React.CSSProperties = { border: "1px solid #111" };

    return (
        <main style={{ maxWidth: 920, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 34, fontWeight: 900 }}>Hostel type</h1>
            <p style={{ marginTop: 8, opacity: 0.7 }}>Pick Men’s or Women’s.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
                <button
                    onMouseEnter={() => setHover("MEN")}
                    onMouseLeave={() => setHover(null)}
                    style={{ ...baseBtn, ...(hover === "MEN" ? hoverBtn : {}) }}
                    onClick={() => {
                        localStorage.setItem("issuedesk_gender", "MEN");
                        router.push("/setup/location");
                    }}
                >
                    Men’s Hostel
                </button>

                <button
                    onMouseEnter={() => setHover("WOMEN")}
                    onMouseLeave={() => setHover(null)}
                    style={{ ...baseBtn, ...(hover === "WOMEN" ? hoverBtn : {}) }}
                    onClick={() => {
                        localStorage.setItem("issuedesk_gender", "WOMEN");
                        router.push("/setup/location");
                    }}
                >
                    Women’s Hostel
                </button>
            </div>
        </main>
    );
}
