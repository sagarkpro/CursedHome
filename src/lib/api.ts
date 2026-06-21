import { forceLogout, getAccessToken } from "@/lib/authBridge";

/**
 * Typed fetch wrapper for the sudox1 backend (VITE_API_BASE_URL).
 *
 * - Auto-injects the Auth0 bearer token on every request.
 * - On 401: forces a silent token refresh and retries once; if that still 401s,
 *   logs the user out.
 * - Mirrors the backend envelope 1:1 (`ResponseDto<T>` / `ErrorDto`) and returns
 *   it to callers as-is.
 * - Paths are always relative to the base URL; absolute URLs are not supported.
 *
 * NOTE: this is for the backend only. The Auth0 IdP /userinfo call lives in
 * useUserInfoSync.ts and must NOT go through here.
 */

/** 1:1 with the backend ErrorDto (Java). `details` is null ~90% of the time. */
export interface ErrorDto {
	message: string;
	details?: string | null;
}

/** 1:1 with the backend ResponseDto<T> (Java). */
export interface ResponseDto<T> {
	success: boolean;
	data: T;
	error: ErrorDto | null;
}

export interface RequestOptions {
	/** Query string params; `undefined` / `null` values are skipped. */
	params?: Record<string, string | number | boolean | null | undefined>;
	/** Extra headers, merged over the defaults. */
	headers?: Record<string, string>;
	/** Abort signal, forwarded to fetch. */
	signal?: AbortSignal;
	/**
	 * Skip bearer injection and the 401 refresh/logout flow. Use for public,
	 * token-agnostic endpoints — a 401 is returned as a normal ResponseDto
	 * instead of logging the user out. Defaults to false.
	 */
	skipAuth?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function buildUrl(path: string, params?: RequestOptions["params"]): string {
	const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
	const url = new URL(path.replace(/^\//, ""), base);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

async function authedFetch(method: Method, url: string, body: unknown, opts: RequestOptions | undefined, forceFresh: boolean): Promise<Response> {
	const headers: Record<string, string> = { ...opts?.headers };

	if (!opts?.skipAuth) {
		const token = await getAccessToken(forceFresh ? { cacheMode: "off" } : undefined);
		if (token) headers["Authorization"] = `Bearer ${token}`;
	}

	const hasBody = body !== undefined && method !== "GET";
	const isFormData = body instanceof FormData;
	if (hasBody && !isFormData && headers["Content-Type"] === undefined) {
		headers["Content-Type"] = "application/json";
	}

	return fetch(url, {
		method,
		headers,
		body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
		signal: opts?.signal,
	});
}

async function toResponseDto<T>(res: Response): Promise<ResponseDto<T>> {
	let json: unknown = null;
	try {
		json = await res.json();
	} catch {
		// Empty / non-JSON body.
	}

	// Backend already speaks ResponseDto — return it untouched.
	if (json && typeof json === "object" && typeof (json as ResponseDto<T>).success === "boolean") {
		return json as ResponseDto<T>;
	}

	// Non-conforming response (proxy/gateway error, empty body, etc.) — synthesize.
	return {
		success: res.ok,
		data: (json ?? null) as T,
		error: res.ok ? null : { message: res.statusText || `HTTP ${res.status}`, details: null },
	};
}

async function request<T>(method: Method, path: string, body?: unknown, opts?: RequestOptions): Promise<ResponseDto<T>> {
	const url = buildUrl(path, opts?.params);

	try {
		let res = await authedFetch(method, url, body, opts, false);

		if (!opts?.skipAuth && res.status === 401) {
			res = await authedFetch(method, url, body, opts, true);
			if (res.status === 401) {
				await forceLogout();
				return { success: false, data: null as T, error: { message: "Session expired", details: null } };
			}
		}

		return await toResponseDto<T>(res);
	} catch (err) {
		// Let aborts propagate (react-query relies on this); wrap everything else
		// so callers always receive a ResponseDto.
		if (err instanceof DOMException && err.name === "AbortError") throw err;
		return { success: false, data: null as T, error: { message: err instanceof Error ? err.message : "Network error", details: null } };
	}
}

export const api = {
	get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
	post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, body, opts),
	put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, body, opts),
	patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, body, opts),
	delete: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("DELETE", path, body, opts),
};
