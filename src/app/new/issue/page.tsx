"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addIssue } from "@/lib/store";

type Priority = "LOW" | "MED" | "HIGH";

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("Failed to read file"));
        r.readAsDataURL(file);
    });
}

export default function NewIssueDetailsPage() {
    const router = useRouter();

    const [step1, setStep1] = useState<any>(null);

    const [category, setCategory] = useState<string>("");
    const [priority, setPriority] = useState<Priority>("LOW");
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("issuedesk_draft_step1");
        if (!raw) {
            router.replace("/new");
            return;
        }
        setStep1(JSON.parse(raw));
    }, [router]);

    const canSubmit = useMemo(() => {
        return title.trim().length > 0 && description.trim().length > 0 && category.trim().length > 0 && step1;
    }, [title, description, category, step1]);

    async function createIssue() {
        if (!canSubmit) return;

        let attachmentDataUrl: string | undefined;
        let attachmentName: string | undefined;

        if (imageFile) {
            attachmentDataUrl = await fileToDataUrl(imageFile);
            attachmentName = imageFile.name;
        }

        const created = await addIssue({
            section: step1.section,
            hostelGender: step1.hostelGender,
            hostelBlock: step1.block,
            roomNumber: step1.roomNumber,

            category,
            priority,
            title: title.trim(),
            description: description.trim(),

            attachmentDataUrl,
            attachmentName,
        } as any);

        localStorage.removeItem("issuedesk_draft_step1");

        const createdId =
            (typeof created === "string" ? created : (created && (created as any).id) ? (created as any).id : null) ??
            null;

        if (createdId) {
            router.push(`/issues/${createdId}`);
            return;
        }

        router.push("/recent");
    }

    return (
        <div style={{ minHeight: "100vh", background: "white" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>
                <h1 style={{ fontSize: 40, fontWeight: 900, textAlign: "center" }}>
                    Now describe the <span style={{ color: "#55B6D8" }}>issue</span>
                </h1>

                <div style={{ height: 36 }} />

                <div style={{ maxWidth: 680, margin: "0 auto" }}>
                    <label style={labelStyle}>Category*</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                        <option value="" disabled>
                            --select--
                        </option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Others">Others</option>
                    </select>

                    <div style={{ height: 16 }} />

                    <label style={labelStyle}>Priority*</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={inputStyle}>
                        <option value="LOW">LOW</option>
                        <option value="MED">MED</option>
                        <option value="HIGH">HIGH</option>
                    </select>

                    <div style={{ height: 16 }} />

                    <label style={labelStyle}>Title*</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short summary"
                        style={inputStyle}
                    />

                    <div style={{ height: 16 }} />

                    <label style={labelStyle}>Description*</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What happened? Any details?"
                        rows={6}
                        style={{ ...inputStyle, resize: "vertical" }}
                    />

                    <div style={{ height: 16 }} />

                    <label style={labelStyle}>Attach image (optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />

                    <div style={{ height: 24 }} />

                    <button
                        onClick={createIssue}
                        disabled={!canSubmit}
                        style={{
                            width: "100%",
                            borderRadius: 12,
                            padding: "14px 16px",
                            fontWeight: 900,
                            fontSize: 16,
                            border: "1px solid #111",
                            background: canSubmit ? "#111" : "#e5e5e5",
                            color: canSubmit ? "white" : "#777",
                            cursor: canSubmit ? "pointer" : "not-allowed",
                        }}
                    >
                        Create issue
                    </button>

                    <div style={{ height: 12 }} />

                    <button
                        type="button"
                        onClick={() => router.push("/new")}
                        style={{
                            width: "100%",
                            borderRadius: 12,
                            padding: "12px 16px",
                            fontWeight: 800,
                            fontSize: 14,
                            border: "1px solid #ddd",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        Back to settings
                    </button>
                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = { fontWeight: 800, fontSize: 18 };

const inputStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 10,
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: "12px 14px",
    fontSize: 16,
    outline: "none",
};
