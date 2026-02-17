"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Domain = "HOSTEL" | "CAMPUS";

export default function SectionPage() {
    const router = useRouter();
    const [domain, setDomain] = useState<Domain>("HOSTEL");

    function next() {
        localStorage.setItem("issuedesk_domain", domain);
        if (domain === "HOSTEL") router.push("/setup/gender");
        else router.push("/setup/location");
    }

    return (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 34, fontWeight: 900 }}>Choose section</h1>
            <p style={{ marginTop: 8, opacity: 0.7 }}>Hostel or Campus.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
                {(["HOSTEL", "CAMPUS"] as Domain[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDomain(d)}
                        style={{
                            padding: 22,
                            borderRadius: 14,
                            border: domain === d ? "2px solid #111" : "1px solid #ddd",
                            background: "#fff",
                            fontWeight: 900,
                            cursor: "pointer",
                        }}
                    >
                        {d === "HOSTEL" ? "Hostel" : "Campus"}
                    </button>
                ))}
            </div>

            <button
                onClick={next}
                style={{
                    marginTop: 28,
                    width: "100%",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #111",
                    background: "#111",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                }}
            >
                Continue
            </button>
        </main>
    );
}
