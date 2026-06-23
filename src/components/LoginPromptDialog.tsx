import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { LogIn } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoginPromptDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Shown when a logged-out user tries to customize (add/edit/delete shortcuts or
 * add/remove wallpapers). The action button kicks off the Auth0 SSO flow, which
 * also hosts registration.
 */
export default function LoginPromptDialog({ open, onOpenChange }: LoginPromptDialogProps) {
	const { loginWithRedirect } = useAuth0();
	const [loggingIn, setLoggingIn] = useState(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<span className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<LogIn className="size-6" />
					</span>
					<DialogTitle>Sign in to customize</DialogTitle>
					<DialogDescription>Customizing your shortcuts and wallpapers needs an account. Log in or create one to make it yours.</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost">Cancel</Button>
					</DialogClose>
					<Button
						loading={loggingIn}
						onClick={() => {
							setLoggingIn(true);
							loginWithRedirect().catch(() => setLoggingIn(false));
						}}
					>
						Login / Register
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
