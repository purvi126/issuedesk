// src/lib/store.ts
export type Section = "HOSTEL" | "CAMPUS";
export type HostelGender = "MEN" | "WOMEN";
export type Priority = "LOW" | "MED" | "HIGH";
export type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";

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
  resolvedAt?: number;

  reviewState?: "PENDING" | "ASSIGNED" | "REJECTED";
  reviewedAt?: number;

  title: string;
  description: string;

  createdAt: number;
  createdById?: string;

  attachmentDataUrl?: string;
  attachmentName?: string;

  upvoters: string[];
  downvoters: string[];

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

  createdById?: string;

  attachmentDataUrl?: string;
  attachmentName?: string;
};

const KEY = "issuedesk_issues_v2";
const LEGACY_KEYS = ["issuedesk_issues", "issuedesk_issues_v1"];

function normalizeStatus(s: any): Status {
  const v = String(s ?? "").toUpperCase();
  if (v === "ASSIGNED") return "IN_PROGRESS";
  if (v === "CLOSED") return "RESOLVED";
  if (v === "OPEN" || v === "IN_PROGRESS" || v === "RESOLVED") return v as Status;
  return "OPEN";
}

function normalizePriority(p: any): Priority {
  const v = String(p ?? "").toUpperCase();
  if (v === "LOW" || v === "MED" || v === "HIGH") return v as Priority;
  return "MED";
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function pad4(n: number) {
  const s = String(n);
  return "0000".slice(s.length) + s;
}

function yymmddFromMs(ms: number) {
  const d = new Date(ms);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/** ID format: YYMMDDXXXX */
export function generateIssueId(now = Date.now()) {
  const base = yymmddFromMs(now);
  const rnd = Math.floor(Math.random() * 10000);
  return `${base}${pad4(rnd)}`;
}

function looksLikeDateId(id: any) {
  if (typeof id !== "string") return false;
  return /^\d{10}$/.test(id); // YYMMDDXXXX
}

function migrateIssue(raw: any): Issue {
  const now = Date.now();
  const createdAt = typeof raw?.createdAt === "number" ? raw.createdAt : now;

  const section: Section = raw?.section === "CAMPUS" ? "CAMPUS" : "HOSTEL";

  const comments = Array.isArray(raw?.comments)
    ? raw.comments
      .map((c: any) => ({
        id: typeof c?.id === "string" ? c.id : `${now}_${Math.random().toString(16).slice(2)}`,
        text: String(c?.text ?? "").trim(),
        createdAt: typeof c?.createdAt === "number" ? c.createdAt : now,
      }))
      .filter((c: any) => c.text.length > 0)
    : [];

  const upvoters = Array.isArray(raw?.upvoters) ? raw.upvoters : [];
  const downvoters = Array.isArray(raw?.downvoters) ? raw.downvoters : [];

  const locationText =
    typeof raw?.locationText === "string" && raw.locationText.trim()
      ? raw.locationText.trim()
      : typeof raw?.location === "string"
        ? raw.location.trim()
        : "Unknown location";

  const id = looksLikeDateId(raw?.id) ? String(raw.id) : generateIssueId(createdAt);

  const createdById =
    typeof raw?.createdById === "string" && raw.createdById.trim()
      ? raw.createdById.trim()
      : undefined;

  return {
    id,
    section,

    hostelGender: raw?.hostelGender === "MEN" || raw?.hostelGender === "WOMEN" ? raw.hostelGender : undefined,
    hostelName: raw?.hostelName ? String(raw.hostelName) : undefined,
    hostelBlock: raw?.hostelBlock ? String(raw.hostelBlock) : undefined,

    buildingName: raw?.buildingName ? String(raw.buildingName) : undefined,

    roomNumber: raw?.roomNumber ? String(raw.roomNumber) : undefined,
    locationText,

    category: String(raw?.category ?? "General"),
    priority: normalizePriority(raw?.priority),
    status: normalizeStatus(raw?.status),
    resolvedAt: typeof raw?.resolvedAt === "number" ? raw.resolvedAt : undefined,

    reviewState:
      raw?.reviewState === "ASSIGNED" || raw?.reviewState === "REJECTED"
        ? raw.reviewState
        : "PENDING",

    reviewedAt:
      typeof raw?.reviewedAt === "number" ? raw.reviewedAt : undefined,

    title: String(raw?.title ?? "Untitled issue"),
    description: String(raw?.description ?? ""),

    createdAt,
    createdById,

    attachmentDataUrl: raw?.attachmentDataUrl ? String(raw.attachmentDataUrl) : undefined,
    attachmentName: raw?.attachmentName ? String(raw.attachmentName) : undefined,

    upvoters,
    downvoters,

    comments,
  };
}

function loadRawArray(): any[] {
  if (typeof window === "undefined") return [];

  const v2 = safeParse<any[]>(localStorage.getItem(KEY));
  if (Array.isArray(v2)) return v2;

  for (const k of LEGACY_KEYS) {
    const legacy = safeParse<any[]>(localStorage.getItem(k));
    if (Array.isArray(legacy)) return legacy;
  }

  return [];
}

function write(issues: Issue[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(issues));
}

function read(): Issue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = loadRawArray();
    const migrated = raw.map(migrateIssue);

    // persist migrated into v2 key for consistency
    write(migrated);

    return migrated;
  } catch {
    return [];
  }
}

export function getIssues(): Issue[] {
  return read().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function getIssue(id: string): Issue | undefined {
  return read().find((i) => i.id === id);
}

export function addIssue(input: CreateIssueInput): Issue {
  const computedLocationText =
    input.section === "HOSTEL"
      ? `${input.hostelGender ?? ""} ${input.hostelName ?? ""} Block ${input.hostelBlock ?? ""}, Room ${input.roomNumber ?? ""}`
        .replace(/\s+/g, " ")
        .trim()
      : `${input.buildingName ?? ""} ${input.roomNumber ?? ""}`.replace(/\s+/g, " ").trim();

  const createdAt = Date.now();

  const issue: Issue = {
    id: generateIssueId(createdAt),
    section: input.section,

    hostelGender: input.hostelGender,
    hostelName: input.hostelName,
    hostelBlock: input.hostelBlock,

    buildingName: input.buildingName,

    roomNumber: input.roomNumber,
    locationText: (input.locationText ?? computedLocationText).trim() || "Unknown location",

    category: input.category,
    priority: normalizePriority(input.priority),
    status: "OPEN",
    resolvedAt: undefined,

    reviewState: "PENDING",
    reviewedAt: undefined,

    title: input.title,
    description: input.description,

    createdAt,
    createdById: input.createdById?.trim() || undefined,

    attachmentDataUrl: input.attachmentDataUrl,
    attachmentName: input.attachmentName,

    upvoters: [],
    downvoters: [],
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

  const prev = issues[idx];
  const nextStatus = patch.status ? normalizeStatus(patch.status) : prev.status;

  const next: Issue = {
    ...prev,
    ...patch,

    status: nextStatus,

    resolvedAt:
      nextStatus === "RESOLVED"
        ? prev.resolvedAt ?? Date.now()
        : undefined,

    reviewState:
      patch.reviewState === "ASSIGNED" ||
        patch.reviewState === "REJECTED" ||
        patch.reviewState === "PENDING"
        ? patch.reviewState
        : prev.reviewState ?? "PENDING",

    reviewedAt:
      patch.reviewState &&
        patch.reviewState !== (prev.reviewState ?? "PENDING")
        ? Date.now()
        : prev.reviewedAt,

    priority: patch.priority ? normalizePriority(patch.priority) : prev.priority,
    upvoters: Array.isArray(patch.upvoters) ? patch.upvoters : prev.upvoters,
    downvoters: Array.isArray(patch.downvoters) ? patch.downvoters : prev.downvoters,
    comments: Array.isArray(patch.comments) ? patch.comments : prev.comments,

    createdById:
      typeof patch.createdById === "string"
        ? patch.createdById.trim() || undefined
        : prev.createdById,
  };

  issues[idx] = next;
  write(issues);
}

export function addComment(issueId: string, text: string) {
  const issues = read();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) return;

  const clean = String(text ?? "").trim();
  if (!clean) return;

  const next = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    text: clean,
    createdAt: Date.now(),
  };

  issues[idx] = { ...issues[idx], comments: [...issues[idx].comments, next] };
  write(issues);
}

/** Voting helpers (Reddit-style) */
export function getUpvoteCount(i: Issue) {
  return i.upvoters?.length ?? 0;
}
export function getDownvoteCount(i: Issue) {
  return i.downvoters?.length ?? 0;
}
export function getScore(i: Issue) {
  return getUpvoteCount(i) - getDownvoteCount(i);
}
export function hasUpvoted(i: Issue, userId: string) {
  return (i.upvoters ?? []).includes(userId);
}
export function hasDownvoted(i: Issue, userId: string) {
  return (i.downvoters ?? []).includes(userId);
}

export function toggleUpvote(issueId: string, userId: string) {
  if (!userId) return;

  const issues = read();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) return;

  const issue = issues[idx];
  const up = new Set(issue.upvoters ?? []);
  const down = new Set(issue.downvoters ?? []);

  if (up.has(userId)) up.delete(userId);
  else {
    up.add(userId);
    down.delete(userId);
  }

  issues[idx] = { ...issue, upvoters: Array.from(up), downvoters: Array.from(down) };
  write(issues);
}

export function toggleDownvote(issueId: string, userId: string) {
  if (!userId) return;

  const issues = read();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) return;

  const issue = issues[idx];
  const up = new Set(issue.upvoters ?? []);
  const down = new Set(issue.downvoters ?? []);

  if (down.has(userId)) down.delete(userId);
  else {
    down.add(userId);
    up.delete(userId);
  }

  issues[idx] = { ...issue, upvoters: Array.from(up), downvoters: Array.from(down) };
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