import { Loader2, TriangleAlert } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: React.ReactNode;
	confirmLabel?: string;
	onConfirm: () => void;
	/** Disables the buttons + shows progress while the underlying mutation runs. */
	pending?: boolean;
}

/**
 * Sensitive destructive-action confirm dialog. Reused for shortcut delete and
 * wallpaper remove — nothing is destroyed without an explicit confirm.
 */
export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Delete", onConfirm, pending = false }: ConfirmDialogProps) {
	return (
		<Dialog open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
			<DialogContent className="sm:max-w-sm" showCloseButton={!pending}>
				<DialogHeader>
					<span className="mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
						<TriangleAlert className="size-6" />
					</span>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost" disabled={pending}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant="destructive" onClick={onConfirm} disabled={pending}>
						{pending && <Loader2 className="animate-spin" />}
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
