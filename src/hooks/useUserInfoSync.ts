import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore, type UserInfo } from "@/store/authStore";

/**
 * After a successful Auth0 login, fetch the profile from the issuer's /userinfo
 * endpoint and stash the access token + result in the global auth store.
 * Clears the store on logout. Mounted once via <AuthBootstrap />.
 */
export function useUserInfoSync() {
	const { isAuthenticated, getAccessTokenSilently } = useAuth0();
	const setAuth = useAuthStore((s) => s.setAuth);
	const reset = useAuthStore((s) => s.reset);

	const query = useQuery({
		queryKey: ["userinfo"],
		enabled: isAuthenticated,
		staleTime: Infinity,
		queryFn: async () => {
			const token = await getAccessTokenSilently();
			const res = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/userinfo`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error(`userinfo request failed: ${res.status}`);
			const data: UserInfo = await res.json();
			setAuth(token, data);
			return data;
		},
	});

	useEffect(() => {
		if (!isAuthenticated) reset();
	}, [isAuthenticated, reset]);

	return query;
}
