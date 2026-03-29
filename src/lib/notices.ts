export type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  expiresAt: number;
};
const KEY = "issuedesk_notices_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(notices: Notice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(notices));
}

function read(): Notice[] {
  if (typeof window === "undefined") return [];

  const data = safeParse<Notice[]>(localStorage.getItem(KEY));
  if (!Array.isArray(data)) return [];

  return data
    .filter(
      (n): n is Notice =>
        !!n &&
        typeof n.id === "string" &&
        typeof n.title === "string" &&
        typeof n.body === "string" &&
        typeof n.createdAt === "number" &&
        typeof n.expiresAt === "number"
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllNotices(): Notice[] {
  return read();
}

export function getActiveNotices(): Notice[] {
  const now = Date.now();
  return read().filter((n) => n.expiresAt > now);
}

export function addNotice(input: {
  title: string;
  body: string;
  durationHours?: number;
}): Notice {
  const now = Date.now();
  const durationHours = input.durationHours ?? 24;

  const notice: Notice = {
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: now,
    expiresAt: now + durationHours * 60 * 60 * 1000,
  };

  const notices = read();
  notices.unshift(notice);
  write(notices);
  return notice;
}

export function deleteNotice(id: string) {
  const notices = read().filter((n) => n.id !== id);
  write(notices);
}

export function clearExpiredNotices() {
  const now = Date.now();
  const notices = read().filter((n) => n.expiresAt > now);
  write(notices);
}