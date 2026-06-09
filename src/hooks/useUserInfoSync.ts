import { useAuth0, type User } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore, type UserInfo } from "@/store/authStore";

function userInfoFromClaims(user: User): UserInfo {
	return {
		sub: user.sub ?? "",
		name: user.name,
		given_name: user.given_name,
		family_name: user.family_name,
		email: user.email,
		email_verified: user.email_verified,
		picture: user.picture,
	};
}

/**
 * After a successful Auth0 login, fetch the profile from the issuer's /userinfo
 * endpoint and stash the access token + result in the global auth store.
 * Each external call is guarded independently so the store is populated even if
 * the token call or /userinfo fails (falls back to the decoded ID-token claims).
 * Clears the store on logout. Mounted once via <AuthBootstrap />.
 */
export function useUserInfoSync() {
	const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
	const setUserInfo = useAuthStore((s) => s.setUserInfo);
	const reset = useAuthStore((s) => s.reset);

	const query = useQuery({
		queryKey: ["userinfo", user?.sub],
		enabled: isAuthenticated,
		staleTime: Infinity,
		retry: 1,
		queryFn: async () => {
			let token: string | null = null;
			try {
				token = await getAccessTokenSilently();
			} catch (e) {
				console.error("[auth] getAccessTokenSilently failed", e);
			}

			let info: UserInfo | null = null;
			if (token) {
				try {
					const res = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/userinfo`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (!res.ok) throw new Error(`userinfo ${res.status}`);
					info = await res.json();
				} catch (e) {
					console.error("[auth] /userinfo failed, falling back to ID-token claims", e);
				}
			}
			if (!info && user) info = userInfoFromClaims(user);

			if (info) setUserInfo(info);
			return info;
		},
	});

	useEffect(() => {
		if (!isAuthenticated) reset();
	}, [isAuthenticated, reset]);

	return query;
}
