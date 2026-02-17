export type Section = "HOSTEL" | "CAMPUS";
export type HostelGender = "MEN" | "WOMEN";
export type Priority = "LOW" | "MED" | "HIGH";
export type Status = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type Issue = {
    id: string;
    section: Section;

    hostelGender?: HostelGender;
    hostelName?: string;
    hostelBlock?: string;

    buildingName?: string;

    roomNumber?: string;
    locationText: string;

    category: string;
    priority: Priority;
    status: Status;

    title: string;
    description: string;

    createdAt: number;

    attachmentDataUrl?: string;
    attachmentName?: string;

    upvoters: string[];
    comments: { id: string; text: string; createdAt: number }[];
};

export type CreateIssueInput = {
    section: Section;

    hostelGender?: HostelGender;
    hostelName?: string;
    hostelBlock?: string;

    buildingName?: string;

    roomNumber?: string;
    locationText?: string;

    category: string;
    priority: Priority;

    title: string;
    description: string;

    attachmentDataUrl?: string;
    attachmentName?: string;
};

const KEY = "issuedesk_issues_v1";

function read(): Issue[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Issue[]) : [];
    } catch {
        return [];
    }
}

function write(issues: Issue[]) {
    localStorage.setItem(KEY, JSON.stringify(issues));
}

export function getIssues(): Issue[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getIssue(id: string): Issue | undefined {
    return read().find((i) => i.id === id);
}

export function addIssue(input: CreateIssueInput): Issue {
    const computedLocationText =
        input.section === "HOSTEL"
            ? `${input.hostelGender ?? ""} ${input.hostelName ?? ""} Block ${input.hostelBlock ?? ""}, Room ${input.roomNumber ?? ""}`.replace(/\s+/g, " ").trim()
            : `${input.buildingName ?? ""} ${input.roomNumber ?? ""}`.replace(/\s+/g, " ").trim();

    const issue: Issue = {
        id: crypto.randomUUID(),
        section: input.section,

        hostelGender: input.hostelGender,
        hostelName: input.hostelName,
        hostelBlock: input.hostelBlock,

        buildingName: input.buildingName,

        roomNumber: input.roomNumber,
        locationText: (input.locationText ?? computedLocationText).trim(),

        category: input.category,
        priority: input.priority,
        status: "OPEN",

        title: input.title,
        description: input.description,

        createdAt: Date.now(),

        attachmentDataUrl: input.attachmentDataUrl,
        attachmentName: input.attachmentName,

        upvoters: [],
        comments: [],
    };

    const issues = read();
    issues.push(issue);
    write(issues);
    return issue;
}

export function updateIssue(id: string, patch: Partial<Issue>) {
    const issues = read();
    const idx = issues.findIndex((i) => i.id === id);
    if (idx === -1) return;
    issues[idx] = { ...issues[idx], ...patch };
    write(issues);
}

export function addComment(issueId: string, text: string) {
    const issues = read();
    const idx = issues.findIndex((i) => i.id === issueId);
    if (idx === -1) return;

    const next = { id: crypto.randomUUID(), text, createdAt: Date.now() };
    issues[idx] = { ...issues[idx], comments: [...issues[idx].comments, next] };
    write(issues);
}

export async function fileToDataUrl(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}
