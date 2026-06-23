import { useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
	/** Existing image URL to preview when no new file is picked. */
	value?: string;
	/** Uploads the picked file and resolves with its hosted URL. Rejects on failure (already toasted by the hook). */
	onUpload: (file: File) => Promise<string>;
	/** Fired with the hosted URL once the upload succeeds. */
	onUploaded: (url: string) => void;
	/** Sub-label, e.g. "PNG, JPG up to 5MB". */
	helperText?: string;
	/** Custom preview node rendered in place of the default thumbnail (spinner still wins while uploading). */
	preview?: React.ReactNode;
	className?: string;
}

export default function ImageUploadField({ value, onUpload, onUploaded, helperText = "PNG, JPG, GIF, WEBP or BMP", preview, className }: ImageUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [localPreview, setLocalPreview] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	// Revoke the object URL when it changes or the field unmounts.
	useEffect(() => {
		return () => {
			if (localPreview) URL.revokeObjectURL(localPreview);
		};
	}, [localPreview]);

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = ""; // allow re-picking the same file
		if (!file) return;

		if (localPreview) URL.revokeObjectURL(localPreview);
		setLocalPreview(URL.createObjectURL(file));
		setUploading(true);
		try {
			const url = await onUpload(file);
			onUploaded(url);
		} catch {
			// Error already surfaced via toast in the upload hook; drop the preview.
			setLocalPreview(null);
		} finally {
			setUploading(false);
		}
	}

	const imagePreview = localPreview ?? value;

	return (
		<button
			type="button"
			disabled={uploading}
			onClick={() => inputRef.current?.click()}
			className={cn("group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-input p-2 transition-colors hover:border-ring hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-70", className)}
		>
			{uploading ? (
				<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<Loader2 className="size-6 animate-spin" />
				</span>
			) : preview ? (
				preview
			) : imagePreview ? (
				<img src={imagePreview} alt="Preview" className="size-16 rounded-2xl border border-border object-cover transition-opacity group-hover:opacity-60" />
			) : (
				<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
					<UploadCloud className="size-6" />
				</span>
			)}
			<span className="text-center">
				<span className="block text-sm font-medium text-foreground/80 group-hover:text-foreground">{uploading ? "Uploading…" : "Click to upload image"}</span>
				<span className="mt-1 block text-xs text-muted-foreground">{helperText}</span>
			</span>
			<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
		</button>
	);
}
