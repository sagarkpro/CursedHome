import { Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DefaultProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	/** Disables the buttons + shows progress while the underlying mutation runs. */
	pending?: boolean;
}

/**
 * Onboarding prompt shown when a logged-in user has no shortcuts and no
 * wallpapers. Offers to seed an opinionated default profile in one click; the
 * user can dismiss it and start from scratch instead.
 */
export default function DefaultProfileDialog({ open, onOpenChange, onConfirm, pending = false }: DefaultProfileDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
			<DialogContent className="sm:max-w-sm" showCloseButton={!pending}>
				<DialogHeader>
					<span className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<Sparkles className="size-6" />
					</span>
					<DialogTitle>Initialize Default Profile</DialogTitle>
					<DialogDescription>
						Your workspace is remarkably vacant. Shall we deploy a standard profile equipped with theoretically useful shortcuts and foundational wallpapers? You naturally retain full authorization to overwrite these presumptions at your leisure.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost" disabled={pending}>
							Defer for Now
						</Button>
					</DialogClose>
					<Button autoFocus onClick={onConfirm} disabled={pending}>
						{pending && <Loader2 className="animate-spin" />}
						Generate Default Profile
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
