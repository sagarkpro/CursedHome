import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function Callback() {
	const { isLoading, error } = useAuth0();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !error) navigate("/", { replace: true });
	}, [isLoading, error, navigate]);

	if (error) {
		return <div className="w-full h-svh flex items-center justify-center text-white">Authentication error: {error.message}</div>;
	}

	return <div className="w-full h-svh flex items-center justify-center text-white">Signing you in…</div>;
}
