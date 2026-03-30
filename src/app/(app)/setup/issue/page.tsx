"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { HOSTEL_CATEGORIES, CAMPUS_CATEGORIES } from "@/lib/constants";

type Priority = "LOW" | "MED" | "HIGH";
type Section = "HOSTEL" | "CAMPUS";
type HostelGender = "MEN" | "WOMEN";

type LocationDraft = {
  section: Section;
  hostelGender?: HostelGender;
  hostelBlock?: string;
  buildingName?: string;
  roomNumber?: string;
};

function readLocationDraft(): LocationDraft | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("issuedesk_location_draft");
  if (raw) {
    try {
      return JSON.parse(raw) as LocationDraft;
    } catch {}
  }

  const section = (localStorage.getItem("issuedesk_section") as Section | null) ?? null;
  if (!section) return null;

  const roomNumber = localStorage.getItem("issuedesk_room") ?? "";

  if (section === "HOSTEL") {
    const hostelGender =
      (localStorage.getItem("issuedesk_gender") as HostelGender | null) ?? "MEN";
    const hostelBlock = localStorage.getItem("issuedesk_hostel_block") ?? "";
    return { section, hostelGender, hostelBlock, roomNumber };
  }

  const buildingName = localStorage.getItem("issuedesk_campus_building") ?? "";
  return { section, buildingName, roomNumber };
}

function buildLocationText(d: LocationDraft) {
  const room = (d.roomNumber ?? "").trim();

  if (d.section === "HOSTEL") {
    const gender = d.hostelGender ?? "MEN";
    const block = (d.hostelBlock ?? "").trim();
    return `${gender} Block ${block}${room ? `, Room ${room}` : ""}`
      .replace(/\s+/g, " ")
      .trim();
  }

  const building = (d.buildingName ?? "").trim();
  return `${building}${room ? ` ${room}` : ""}`.replace(/\s+/g, " ").trim();
}

export default function SetupIssuePage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const draft = useMemo(() => readLocationDraft(), []);
  const locationText = draft ? buildLocationText(draft) : "Unknown location";

  const categories = useMemo(() => {
    if (!draft) return [];
    return draft.section === "HOSTEL"
      ? [...HOSTEL_CATEGORIES]
      : [...CAMPUS_CATEGORIES];
  }, [draft]);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      status === "authenticated" &&
      !!draft &&
      category.trim().length > 0 &&
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      !submitting
    );
  }, [status, draft, category, title, description, submitting]);

  async function create() {
    if (!canSubmit || !draft) return;

    setSubmitting(true);

    try {
      const payload = {
        section: draft.section,
        hostelGender: draft.section === "HOSTEL" ? draft.hostelGender ?? "" : "",
        hostelName: "",
        hostelBlock: draft.section === "HOSTEL" ? draft.hostelBlock ?? "" : "",
        campusBlock: draft.section === "CAMPUS" ? draft.buildingName ?? "" : "",
        roomNumber: draft.roomNumber ?? "",
        locationText,
        category: category.trim(),
        priority,
        title: title.trim(),
        description: description.trim(),
        createdByEmail: (session?.user?.email ?? "").trim().toLowerCase(),
        attachmentName: imageFile?.name ?? "",
      };

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create issue");
      }

      const newId = data?.insertedId || data?.issue?._id;

      localStorage.removeItem("issuedesk_location_draft");

      if (newId) {
        router.push(`/issues/${newId}`);
      } else {
        router.push("/my-issues");
      }
    } catch (error) {
      console.error("[setup/issue] create failed:", error);
      alert(error instanceof Error ? error.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  }

  if (!draft) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
          Missing setup data. Go back to setup and select section/location.
          <div className="mt-4">
            <button
              onClick={() => router.push("/setup/section")}
              className="h-10 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-semibold text-blue-200 hover:bg-blue-500/15"
            >
              Go to section
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Raise Issue
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Location: <span className="font-semibold text-white/80">{locationText}</span>
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>
                  -- select --
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="LOW">LOW</option>
                <option value="MED">MED</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short title"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem"
                rows={6}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">
                Attach image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-white/70 file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white/80 hover:file:border-blue-400/30 hover:file:bg-blue-500/10"
              />
              {imageFile ? (
                <div className="text-xs text-white/50">Selected: {imageFile.name}</div>
              ) : null}
            </div>

            <button
              onClick={create}
              disabled={!canSubmit}
              className={[
                "h-11 w-full rounded-xl border px-4 text-sm font-semibold transition",
                canSubmit
                  ? "border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/15"
                  : "cursor-not-allowed border-white/10 bg-white/5 text-white/40",
              ].join(" ")}
            >
              {submitting ? "Creating..." : "Create issue"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/setup/location")}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}