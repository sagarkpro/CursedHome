import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./BrandMark";

interface AuthErrorProps {
	error: Error;
}

export function AuthError({ error }: AuthErrorProps) {
	const { loginWithRedirect } = useAuth0();
	const navigate = useNavigate();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
			role="alert"
			aria-live="assertive"
		>
			{/* Ambient glows to match loader shell */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-300/[0.06] blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/[0.03] blur-[120px] pointer-events-none" />

			<motion.div
				initial={{ y: 8, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
				className="relative flex flex-col items-center gap-8 px-6 text-center"
			>
				{/* Brand mark above error */}
				<BrandMark />

				{/* Error icon */}
				<div className="relative flex size-14 items-center justify-center rounded-full bg-rose-300/10">
					<TriangleAlert className="size-6 text-rose-300" />
					<div className="absolute inset-0 rounded-full bg-rose-300/10 blur-xl -z-10" />
				</div>

				{/* Title + message */}
				<div className="flex flex-col items-center gap-2">
					<p className="text-base font-semibold tracking-tight text-foreground">Authentication failed</p>
					<p className="max-w-xs text-sm text-neutral-400 font-medium tracking-tight">{error.message}</p>
				</div>

				{/* Recovery actions */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" onClick={() => navigate("/", { replace: true })}>
						Back to home
					</Button>
					<Button onClick={() => loginWithRedirect()}>Retry login</Button>
				</div>
			</motion.div>

			{/* Version tag bottom corner */}
			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-neutral-600 tracking-wider">v0.1.0-beta</div>
		</motion.div>
	);
}
