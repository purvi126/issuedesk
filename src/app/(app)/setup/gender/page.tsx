"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Gender = "MEN" | "WOMEN";

function card(active: boolean): React.CSSProperties {
    return {
        padding: 18,
        borderRadius: 18,
        border: active ? "1px solid rgba(0,190,255,0.55)" : "1px solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow)",
        cursor: "pointer",
        display: "grid",
        gap: 12,
        placeItems: "center",
        transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
        transform: active ? "translateY(-1px)" : "translateY(0px)",
    };
}

export default function GenderPage() {
    const router = useRouter();
    const [picked, setPicked] = useState<Gender>("MEN");

    function choose(g: Gender) {
        setPicked(g);
        localStorage.setItem("issuedesk_gender", g);
        router.push("/setup/location");
    }

    return (
        <main style={{ maxWidth: 980, margin: "32px auto", padding: 24 }}>
            <h1 style={{ fontSize: 34, fontWeight: 1000 }}>Hostel type</h1>
            <p style={{ marginTop: 8, color: "var(--muted)", fontWeight: 700 }}>
                Pick Men’s or Women’s.
            </p>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 16,
                    marginTop: 22,
                }}
            >
                <button onClick={() => choose("MEN")} style={card(picked === "MEN")}>
                    <Image src="/illus/men.png" alt="Men" width={160} height={160} style={{ borderRadius: 24 }} />
                    <div style={{ fontWeight: 1000, fontSize: 18 }}>Men’s Hostel</div>
                </button>

                <button onClick={() => choose("WOMEN")} style={card(picked === "WOMEN")}>
                    <Image src="/illus/women.png" alt="Women" width={160} height={160} style={{ borderRadius: 24 }} />
                    <div style={{ fontWeight: 1000, fontSize: 18 }}>Women’s Hostel</div>
                </button>
            </div>
        </main>
    );
}