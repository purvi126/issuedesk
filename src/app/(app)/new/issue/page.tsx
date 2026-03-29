"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Priority = "LOW" | "MED" | "HIGH";
type Section = "HOSTEL" | "CAMPUS";
type HostelGender = "MEN" | "WOMEN";

type DraftStep1 = {
  section: Section;
  hostelGender?: HostelGender;
  hostelName?: string;
  block?: string;
  hostelBlock?: string;
  roomNumber?: string;
  campusBlock?: string;
  buildingName?: string;
  locationText?: string;
};

const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Carpentry",
  "Cleaning",
  "IT Support",
  "Others",
] as const;

export default function NewIssueDetailsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [step1, setStep1] = useState<DraftStep1 | null>(null);

  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("issuedesk_draft_step1");
    if (!raw) {
      router.replace("/new");
      return;
    }

    try {
      setStep1(JSON.parse(raw));
    } catch {
      localStorage.removeItem("issuedesk_draft_step1");
      router.replace("/new");
    }
  }, [router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent("/new/issue")}`);
    }
  }, [status, router]);

  const canSubmit = useMemo(() => {
    return (
      !!step1 &&
      category.trim().length > 0 &&
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      !submitting
    );
  }, [category, title, description, step1, submitting]);

  async function createIssue() {
    if (!canSubmit || !step1) return;

    try {
      setSubmitting(true);

      const hostelBlock = step1.hostelBlock ?? step1.block;
      const createdByEmail = session?.user?.email ?? "student@vit.ac.in";

      const payload = {
        section: step1.section,
        hostelGender: step1.hostelGender ?? "",
        hostelName: step1.hostelName ?? "",
        hostelBlock: hostelBlock ?? "",
        campusBlock: step1.campusBlock ?? step1.buildingName ?? "",
        roomNumber: step1.roomNumber ?? "",
        locationText: step1.locationText ?? "",
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        createdByEmail,
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
        throw new Error(data?.error || data?.message || "Failed to create issue");
      }

      localStorage.removeItem("issuedesk_draft_step1");
      router.push("/recent");
    } catch (error) {
      console.error("Create issue failed:", error);
      alert(error instanceof Error ? error.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  }

  if (!step1) {
    return (
      <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Now describe the <span className="text-blue-200">issue</span>
        </h1>
        <p className="mt-3 text-center text-sm text-white/60">
          Fill the details. You’ll be redirected after creation.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-sm backdrop-blur">
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
                {CATEGORIES.map((c) => (
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
                placeholder="Short summary"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? Any details?"
                rows={6}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-white/80">Attach image (optional)</label>
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
              onClick={createIssue}
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
              onClick={() => router.push("/new")}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/75 hover:border-blue-400/30 hover:bg-blue-500/10"
            >
              Back to settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}