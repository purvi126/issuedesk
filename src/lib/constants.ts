export const MEN_BLOCKS = [
    "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T"
] as const;

export const WOMEN_BLOCKS = [
    "A", "B", "C", "D", "E", "F", "G", "H", "J"
] as const;

export const CAMPUS_BUILDINGS = [
    "Main Building",
    "GDN",
    "CBMR",
    "CDMM",
    "TT",
    "SMV",
    "SJT",
    "SJT Annex",
    "PRP",
    "PRP Annex",
    "Gandhi Block"
] as const;

export const HOSTEL_CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Housekeeping",
    "Furniture",
    "Laundry Room",
    "Security",
    "IT Support",
    "Others"
] as const;

export const CAMPUS_CATEGORIES = [
    "Classroom Infra",
    "IT Support",
    "Library",
    "Transport",
    "Cleaning",
    "Others"
] as const;

export type MenBlock = (typeof MEN_BLOCKS)[number];
export type WomenBlock = (typeof WOMEN_BLOCKS)[number];
export type CampusBuilding = (typeof CAMPUS_BUILDINGS)[number];
export type HostelCategory = (typeof HOSTEL_CATEGORIES)[number];
export type CampusCategory = (typeof CAMPUS_CATEGORIES)[number];
