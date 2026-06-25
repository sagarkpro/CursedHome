import { api, type ResponseDto } from "@/lib/api";
import type { SiteData } from "@/models/SiteData";

/**
 * Bare PersonalizationController calls (`/api/personalization/*`).
 *
 * These return the raw backend envelope (`ResponseDto<T>`). Higher layers
 * (the use*.ts hooks) unwrap them via `unwrap()`. Components must never call
 * these directly — always go through the hooks.
 *
 * `/default` endpoints are public, so they pass `skipAuth: true`.
 */

const BASE = "/api/personalization";

/** Create/edit payload (PersonalizationConfigurationDto minus the server `id`). */
export type ShortcutPayload = Pick<SiteData, "type" | "name" | "url" | "image">;

// ---- Shortcuts ----

export const getShortcuts = () => api.get<SiteData[]>(`${BASE}/shortcut`);

export const getDefaultShortcuts = () => api.get<SiteData[]>(`${BASE}/shortcut/default`, { skipAuth: true });

export const createShortcut = (dto: ShortcutPayload) => api.post<null>(`${BASE}/shortcut`, dto);

export const updateShortcut = (id: string, dto: ShortcutPayload) => api.put<null>(`${BASE}/${id}/shortcut`, dto);

export const deleteShortcut = (id: string) => api.delete<null>(`${BASE}/${id}/shortcut`);

/** Move shortcut `id` to sit between `prev` and `next` (either null = list head/tail). */
export interface ShortcutReorder {
	id: string;
	prev: string | null;
	next: string | null;
}

export const reorderShortcut = (dto: ShortcutReorder) => api.post<null>(`${BASE}/shortcut/reorder`, dto);

// ---- Wallpapers ----

export const getWallpapers = () => api.get<string[]>(`${BASE}/wallpapers`);

export const getDefaultWallpapers = () => api.get<string[]>(`${BASE}/wallpapers/default`, { skipAuth: true });

/** Full-list replace — send the complete set the user should end up with. */
export const updateWallpapers = (urls: string[]) => api.post<null>(`${BASE}/wallpapers`, urls);

// ---- Defaults ----

/** Wipes existing personalization and seeds an opinionated default set. Auth required. */
export const initializeDefaults = () => api.post<null>(`${BASE}/initialize-defaults`);

// ---- Image upload (multipart, field name "file") ----

function fileForm(file: File): FormData {
	const fd = new FormData();
	fd.append("file", file);
	return fd;
}

export const uploadShortcutImage = (file: File) => api.post<string>(`${BASE}/shortcuts/image`, fileForm(file));

export const uploadWallpaperImage = (file: File) => api.post<string>(`${BASE}/wallpapers/image`, fileForm(file));

// ---- Helpers ----

/** Unwrap the envelope: return `data` on success, throw `error.message` otherwise. */
export function unwrap<T>(res: ResponseDto<T>): T {
	if (!res.success) throw new Error(res.error?.message ?? "Request failed");
	return res.data;
}

const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];

/**
 * Client-side mirror of the backend image rules. Throws a user-facing Error on
 * the first failing rule so callers can surface `.message` via toast.
 */
export function validateImage(file: File, opts: { maxMB: number }): void {
	const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
	if (!file.type.startsWith("image/")) throw new Error("Invalid file type");
	if (!ALLOWED_EXT.includes(ext)) throw new Error("Unsupported file extension");
	if (file.size > opts.maxMB * 1024 * 1024) throw new Error(`File exceeds ${opts.maxMB}MB limit`);
}
