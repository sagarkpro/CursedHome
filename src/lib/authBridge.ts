import type { Auth0ContextInterface } from "@auth0/auth0-react";

/**
 * Bridges Auth0's React-only helpers (`getAccessTokenSilently`, `logout`) into
 * plain, non-React modules such as the `api` fetch wrapper.
 *
 * <AuthBootstrap /> registers the live functions from `useAuth0()` once it has
 * mounted inside <Auth0Provider />. The api wrapper then pulls tokens and
 * triggers logout through here without needing hook access.
 */

type GetAccessTokenSilently = Auth0ContextInterface["getAccessTokenSilently"];
type Logout = Auth0ContextInterface["logout"];

let getTokenRef: GetAccessTokenSilently | null = null;
let logoutRef: Logout | null = null;

/** Called once from <AuthBootstrap /> with the live Auth0 helpers. */
export function registerAuth(getToken: GetAccessTokenSilently, logout: Logout): void {
	getTokenRef = getToken;
	logoutRef = logout;
}

/**
 * Returns the current access token, or null if Auth0 hasn't registered yet or
 * the silent fetch fails. Pass `{ cacheMode: "off" }` to force a refresh.
 */
export async function getAccessToken(opts?: Parameters<GetAccessTokenSilently>[0]): Promise<string | null> {
	if (!getTokenRef) return null;
	try {
		const result = await getTokenRef(opts as never);
		// Without `detailedResponse`, Auth0 returns the raw token string; guard the
		// verbose-response overload just in case.
		return typeof result === "string" ? result : result.access_token;
	} catch {
		return null;
	}
}

/** Logs the user out and redirects back to the app origin. No-op if unregistered. */
export async function forceLogout(): Promise<void> {
	if (!logoutRef) return;
	await logoutRef({ logoutParams: { returnTo: window.location.origin } });
}
