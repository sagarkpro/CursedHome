import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserInfoSync } from "@/hooks/useUserInfoSync";
import { registerAuth } from "@/lib/authBridge";

/**
 * Headless component: runs the /userinfo sync once at app level and registers
 * the Auth0 token/logout helpers into the api wrapper's auth bridge.
 * Must live inside both Auth0Provider and QueryClientProvider.
 */
export default function AuthBootstrap() {
	const { getAccessTokenSilently, logout } = useAuth0();

	useEffect(() => {
		registerAuth(getAccessTokenSilently, logout);
	}, [getAccessTokenSilently, logout]);

	useUserInfoSync();
	return null;
}
