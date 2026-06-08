import { useUserInfoSync } from "@/hooks/useUserInfoSync";

/**
 * Headless component: runs the /userinfo sync once at app level.
 * Must live inside both Auth0Provider and QueryClientProvider.
 */
export default function AuthBootstrap() {
	useUserInfoSync();
	return null;
}
