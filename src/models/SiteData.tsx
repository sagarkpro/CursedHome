export type ShortcutType = "WEB" | "REPOSITORY";

export interface SiteData {
    id: string;            // UUID
    type: ShortcutType;    // "WEB" | "REPOSITORY"
    name: string;
    url: string;
    image?: string;        // nullable
}
