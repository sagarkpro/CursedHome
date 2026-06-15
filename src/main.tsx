import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "sonner";
import "./index.css";
import { router } from "./router.tsx";
import AuthBootstrap from "./components/AuthBootstrap";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Auth0Provider
			domain={import.meta.env.VITE_AUTH0_DOMAIN}
			clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
			authorizationParams={{
				redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
				scope: "openid profile email offline_access",
			}}
			useRefreshTokens={true}
			cacheLocation="localstorage"
			useCookiesForTransactions={true} // VIP, if set to false, breaks the password reset flow
		>
			<QueryClientProvider client={queryClient}>
				<AuthBootstrap />
				<RouterProvider router={router} />
				<Toaster position="top-right" toastOptions={{ style: { color: "var(--background)" } }} />
			</QueryClientProvider>
		</Auth0Provider>
	</StrictMode>,
);
