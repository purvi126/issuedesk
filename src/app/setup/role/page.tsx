"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "STUDENT" | "ADMIN" | "TECH";

export default function RolePage() {
    const router = useRouter();
    const [role, setRole] = useState<Role>("STUDENT");

    function next() {
        localStorage.setItem("issuedesk_role", role);
        router.push("/setup/section");
    }

    return (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
            <h1 style={{ fontSize: 34, fontWeight: 900 }}>Who are you?</h1>
            <p style={{ marginTop: 8, opacity: 0.7 }}>Pick your role to continue.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
                {(["STUDENT", "ADMIN", "TECH"] as Role[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRole(r)}
                        style={{
                            padding: 18,
                            borderRadius: 14,
                            border: role === r ? "2px solid #111" : "1px solid #ddd",
                            background: "#fff",
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        {r === "STUDENT" ? "Student" : r === "ADMIN" ? "Admin" : "Technician"}
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
