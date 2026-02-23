"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Section = "HOSTEL" | "CAMPUS";
type HostelGender = "MEN" | "WOMEN";

const BLOCKS = Array.from({ length: 20 }, (_, i) =>
  String.fromCharCode("A".charCodeAt(0) + i)
);

// Keep these simple for demo; you can expand later.
const HOSTELS_MEN = ["MH-A", "MH-B", "MH-C", "MH-D"];
const HOSTELS_WOMEN = ["LH-A", "LH-B", "LH-C"];

const CAMPUS_BUILDINGS = ["Main Block", "Library", "Academic Block", "Lab Complex", "Admin Block", "Other"];

export default function NewIssueSettingsPage() {
  const router = useRouter();
  const { status } = useSession();

  // Fallback; proxy should protect /new already
  if (status === "unauthenticated") {
    router.push(`/login?next=${encodeURIComponent("/new")}`);
  }

  const [section, setSection] = useState<Section>("HOSTEL");

  // HOSTEL
  const [hostelGender, setHostelGender] = useState<HostelGender>("MEN");
  const [hostelName, setHostelName] = useState<string>("");
  const [block, setBlock] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");

  // CAMPUS
  const [buildingName, setBuildingName] = useState<string>("");
  const [campusRoom, setCampusRoom] = useState<string>("");

  const isHostel = section === "HOSTEL";

  const hostelOptions = useMemo(() => {
    return hostelGender === "MEN" ? HOSTELS_MEN : HOSTELS_WOMEN;
  }, [hostelGender]);

  const canContinue = useMemo(() => {
    if (isHostel) {
      return (
        hostelGender !== undefined &&
        hostelName.trim().length > 0 &&
        block.trim().length > 0 &&
        roomNumber.trim().length > 0
      );
    }
    return buildingName.trim().length > 0; // campus needs building at least
  }, [isHostel, hostelGender, hostelName, block, roomNumber, buildingName]);

  function saveAndContinue() {
    if (!canContinue) return;

    const draft: any = {
      section,
      roomNumber: isHostel ? roomNumber.trim() : campusRoom.trim(),
    };

    if (isHostel) {
      draft.hostelGender = hostelGender;
      draft.hostelName = hostelName.trim();
      draft.block = block.trim();
    } else {
      draft.buildingName = buildingName.trim();
    }

    localStorage.setItem("issuedesk_draft_step1", JSON.stringify(draft));
    router.push("/new/issue");
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          First, we need your <span className="text-blue-200">location</span>
        </h1>
        <p className="mt-3 text-center text-sm text-white/60">
          Choose where the issue is happening. You’ll add details on the next screen.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur">
          {/* Section */}
          <div>
            <div className="text-sm font-semibold text-white/80">Section *</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ChoiceCard
                title="Hostel"
                selected={section === "HOSTEL"}
                onClick={() => setSection("HOSTEL")}
              />
              <ChoiceCard
                title="Campus"
                selected={section === "CAMPUS"}
                onClick={() => setSection("CAMPUS")}
              />
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            {isHostel ? (
              <div className="grid gap-4">
                {/* hostel gender */}
                <div>
                  <div className="text-sm font-semibold text-white/80">Hostel type *</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <ChoiceCard
                      title="Men"
                      selected={hostelGender === "MEN"}
                      onClick={() => {
                        setHostelGender("MEN");
                        setHostelName("");
                      }}
                    />
                    <ChoiceCard
                      title="Women"
                      selected={hostelGender === "WOMEN"}
                      onClick={() => {
                        setHostelGender("WOMEN");
                        setHostelName("");
                      }}
                    />
                  </div>
                </div>

                {/* hostel name */}
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Hostel name *</label>
                  <select
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    {hostelOptions.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* block */}
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-white/80">Block *</label>
                    <select
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="" disabled>
                        -- select --
                      </option>
                      {BLOCKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* room */}
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-white/80">Room number *</label>
                    <input
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g., 204"
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-white/80">Building *</label>
                  <select
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
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
                  <label className="text-sm font-semibold text-white/80">Room / area (optional)</label>
                  <input
                    value={campusRoom}
                    onChange={(e) => setCampusRoom(e.target.value)}
                    placeholder="e.g., 2nd floor, Lab 3, Room 110"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="text-sm text-white/55">
                  You can also refine the exact location in the next step.
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={saveAndContinue}
              disabled={!canContinue}
              className={[
                "h-11 w-full rounded-xl border px-4 text-sm font-semibold transition",
                canContinue
                  ? "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                  : "border-white/10 bg-white/5 text-white/40 cursor-not-allowed",
              ].join(" ")}
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
  selected,
  onClick,
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-center transition",
        selected
          ? "border-blue-400/30 bg-blue-500/10"
          : "border-white/10 bg-white/5 hover:border-blue-400/25 hover:bg-blue-500/5",
      ].join(" ")}
    >
      <div className="text-sm font-semibold text-white/90">{title}</div>
    </button>
  );
}