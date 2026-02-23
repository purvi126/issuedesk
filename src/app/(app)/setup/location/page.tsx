"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CAMPUS_BUILDINGS, MEN_BLOCKS, WOMEN_BLOCKS } from "@/lib/constants";
import type { Section, HostelGender } from "@/lib/store";

export default function LocationPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextParam = sp.get("next") || "";

  const section: Section =
    (typeof window !== "undefined"
      ? (localStorage.getItem("issuedesk_section") as Section | null)
      : null) ?? "HOSTEL";

  const genderRaw =
    typeof window !== "undefined" ? localStorage.getItem("issuedesk_gender") : null;

  const gender: HostelGender = genderRaw === "WOMEN" ? "WOMEN" : "MEN";

  const blocks = useMemo(() => {
    return gender === "WOMEN" ? [...WOMEN_BLOCKS] : [...MEN_BLOCKS];
  }, [gender]);

  // Optional debug log (remove later)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("section", section, "gender", gender, "blocks", blocks.length);
  }, [section, gender, blocks.length]);

  const [block, setBlock] = useState("");
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");

  const isHostel = section === "HOSTEL";
  const canNext =
    room.trim().length > 0 && (isHostel ? block.trim().length > 0 : building.trim().length > 0);

  function next() {
    if (!canNext) return;

    if (isHostel) {
      localStorage.setItem("issuedesk_hostel_block", block.trim());
      localStorage.removeItem("issuedesk_campus_building");
    } else {
      localStorage.setItem("issuedesk_campus_building", building.trim());
      localStorage.removeItem("issuedesk_hostel_block");
    }

    localStorage.setItem("issuedesk_room", room.trim());

    localStorage.setItem(
      "issuedesk_location_draft",
      JSON.stringify({
        section,
        hostelGender: isHostel ? gender : undefined,
        hostelBlock: isHostel ? block.trim() : undefined,
        buildingName: !isHostel ? building.trim() : undefined,
        roomNumber: room.trim(),
      })
    );

    router.push(`/setup/issue${nextParam ? `?next=${encodeURIComponent(nextParam)}` : ""}`);
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Location</h1>
        <p className="mt-2 text-sm text-white/60">
          {isHostel ? "Select block and room number." : "Select building and room/lab."}
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {isHostel ? (
              <>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Block</label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    {blocks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Room number</label>
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g., 204"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Building</label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Room / Lab</label>
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g., 312 / Lab 5"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={next}
            disabled={!canNext}
            className={[
              "mt-6 h-11 rounded-xl border px-5 text-sm font-semibold transition",
              canNext
                ? "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                : "border-white/10 bg-white/5 text-white/40 cursor-not-allowed",
            ].join(" ")}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}