"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPUS_BUILDINGS, MEN_BLOCKS, WOMEN_BLOCKS } from "@/lib/constants";
import type { Section, HostelGender } from "@/lib/store";

export default function LocationPage() {
  const router = useRouter();

  const domain =
    (typeof window !== "undefined"
      ? (localStorage.getItem("issuedesk_domain") as Section | null)
      : null) ?? "HOSTEL";

  const gender =
    (typeof window !== "undefined"
      ? (localStorage.getItem("issuedesk_gender") as HostelGender | null)
      : null) ?? "MEN";

  const blocks = useMemo(() => (gender === "WOMEN" ? WOMEN_BLOCKS : MEN_BLOCKS), [gender]);

  const [block, setBlock] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");

  const canNext =
    room.trim().length > 0 && (domain === "HOSTEL" ? block.trim().length > 0 : building.trim().length > 0);

  function next() {
    if (!canNext) return;

    if (domain === "HOSTEL") {
      localStorage.setItem("issuedesk_hostel_block", block);
    } else {
      localStorage.setItem("issuedesk_campus_building", building);
    }

    localStorage.setItem("issuedesk_room", room.trim());
    router.push("/setup/issue");
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h2 style={{ marginTop: 0 }}>Location</h2>
      <p style={{ color: "#555" }}>
        {domain === "HOSTEL" ? "Select block and room number." : "Select building and room/lab."}
      </p>

      {domain === "HOSTEL" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          <div>
            <label style={{ fontWeight: 700 }}>Block</label>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
            >
              <option value="" disabled>
                --select--
              </option>
              {blocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Room number</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., 204"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
          <div>
            <label style={{ fontWeight: 700 }}>Building</label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
            >
              <option value="" disabled>
                --select--
              </option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 700 }}>Room / Lab</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g., 312 / Lab 5"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <button
          onClick={next}
          disabled={!canNext}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "1px solid #111",
            background: canNext ? "#111" : "#777",
            color: "#fff",
            cursor: canNext ? "pointer" : "not-allowed",
            fontWeight: 700,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
