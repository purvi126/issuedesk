export type AppRole = "STUDENT" | "TECH" | "ADMIN";

export const ROLE_KEY = "issuedesk_role";

export function getStoredRole(): AppRole | null {
  if (typeof window === "undefined") return null;

  const role = sessionStorage.getItem(ROLE_KEY);

  if (role === "STUDENT" || role === "TECH" || role === "ADMIN") {
    return role;
  }

  return null;
}

export function isRole(value: string | null): value is AppRole {
  return value === "STUDENT" || value === "TECH" || value === "ADMIN";
}

export function dashboardFor(role: AppRole): string {
  if (role === "ADMIN") return "/admin/board";
  if (role === "TECH") return "/tech/assigned";
  return "/issues";
}