import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { GlobalLoader } from "./components/GlobalLoader";
import { AuthError } from "./components/AuthError";

export default function Callback() {
	const { isLoading, error } = useAuth0();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !error) navigate("/", { replace: true });
	}, [isLoading, error, navigate]);

	if (error) {
		return <AuthError error={error} />;
	}

	return <GlobalLoader message="Signing you in…" />;
}
