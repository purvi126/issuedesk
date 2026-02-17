"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPUS_CATEGORIES, HOSTEL_CATEGORIES } from "@/lib/constants";
import { addIssue, fileToDataUrl } from "@/lib/store";
import type { Section, HostelGender, Priority } from "@/lib/store";

export default function IssuePage() {
    const router = useRouter();

    const section =
        (typeof window !== "undefined"
            ? (localStorage.getItem("issuedesk_domain") as Section | null)
            : null) ?? "HOSTEL";

    const gender =
        (typeof window !== "undefined"
            ? (localStorage.getItem("issuedesk_gender") as HostelGender | null)
            : null) ?? "MEN";

    const hostelBlock =
        (typeof window !== "undefined" ? localStorage.getItem("issuedesk_hostel_block") : null) ?? "";

    const campusBuilding =
        (typeof window !== "undefined" ? localStorage.getItem("issuedesk_campus_building") : null) ?? "";

    const room = (typeof window !== "undefined" ? localStorage.getItem("issuedesk_room") : null) ?? "";

    const categories = useMemo(
        () => (section === "HOSTEL" ? HOSTEL_CATEGORIES : CAMPUS_CATEGORIES),
        [section]
    );

    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState<Priority | "">("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [fileName, setFileName] = useState<string>("");
    const [fileDataUrl, setFileDataUrl] = useState<string>("");

    const locationText =
        section === "HOSTEL"
            ? `${gender} Block ${hostelBlock}, Room ${room}`.replace(/\s+/g, " ").trim()
            : `${campusBuilding} ${room}`.replace(/\s+/g, " ").trim();

    const canCreate =
        category.trim().length > 0 &&
        priority !== "" &&
        title.trim().length > 0 &&
        description.trim().length > 0;

    async function onPickFile(f: File | null) {
        if (!f) {
            setFileName("");
            setFileDataUrl("");
            return;
        }
        const url = await fileToDataUrl(f);
        setFileName(f.name);
        setFileDataUrl(url);
    }

    function createIssue() {
        if (!canCreate) return;

        const created = addIssue({
            section,
            hostelGender: section === "HOSTEL" ? gender : undefined,
            hostelBlock: section === "HOSTEL" ? hostelBlock : undefined,
            buildingName: section === "CAMPUS" ? campusBuilding : undefined,
            roomNumber: room,
            locationText,
            category,
            priority: priority as Priority,
            title: title.trim(),
            description: description.trim(),
            attachmentName: fileName || undefined,
            attachmentDataUrl: fileDataUrl || undefined,
        });

        router.push(`/recent?id=${created.id}`);
    }

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
            <h2 style={{ marginTop: 0 }}>Raise Issue</h2>
            <p style={{ color: "#555", marginTop: 6 }}>{locationText}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                <div>
                    <label style={{ fontWeight: 700 }}>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
                    >
                        <option value="" disabled>
                            --select--
                        </option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 700 }}>Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
                    >
                        <option value="" disabled>
                            --select--
                        </option>
                        <option value="LOW">LOW</option>
                        <option value="MED">MED</option>
                        <option value="HIGH">HIGH</option>
                    </select>
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 700 }}>Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short title"
                    style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8 }}
                />
            </div>

            <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 700 }}>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the problem"
                    rows={5}
                    style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd", marginTop: 8, resize: "vertical" }}
                />
            </div>

            <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 700 }}>Attach image (optional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    style={{ display: "block", marginTop: 8 }}
                />
                {fileName ? <div style={{ marginTop: 8, color: "#555" }}>{fileName}</div> : null}
            </div>

            <div style={{ marginTop: 22 }}>
                <button
                    onClick={createIssue}
                    disabled={!canCreate}
                    style={{
                        padding: "12px 18px",
                        borderRadius: 10,
                        border: "1px solid #111",
                        background: canCreate ? "#111" : "#777",
                        color: "#fff",
                        cursor: canCreate ? "pointer" : "not-allowed",
                        fontWeight: 800,
                    }}
                >
                    Create Issue
                </button>
            </div>
        </div>
    );
}
