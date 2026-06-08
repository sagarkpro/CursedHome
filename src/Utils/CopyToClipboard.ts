import { toast } from "sonner";

export function copyToClipboard(value: string) {
	if (globalThis?.navigator?.clipboard) {
		globalThis.navigator.clipboard.writeText(value);
		toast.success("Copied to clipboard!");
	}
}
