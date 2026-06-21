import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
	/** Existing image URL to preview when no new file is picked. */
	value?: string;
	/** Fired with the picked File. Actual upload is wired later. */
	onFileSelected: (file: File) => void;
	className?: string;
}

export default function ImageUploadField({ value, onFileSelected, className }: ImageUploadFieldProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [localPreview, setLocalPreview] = useState<string | null>(null);

	// Revoke the object URL when it changes or the field unmounts.
	useEffect(() => {
		return () => {
			if (localPreview) URL.revokeObjectURL(localPreview);
		};
	}, [localPreview]);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (localPreview) URL.revokeObjectURL(localPreview);
		setLocalPreview(URL.createObjectURL(file));
		onFileSelected(file);
	}

	const preview = localPreview ?? value;

	return (
		<button
			type="button"
			onClick={() => inputRef.current?.click()}
			className={cn(
				"group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-input p-6 transition-colors hover:border-ring hover:bg-muted/50",
				className
			)}
		>
			{preview ? (
				<img src={preview} alt="Preview" className="size-16 rounded-2xl border border-border object-cover transition-opacity group-hover:opacity-60" />
			) : (
				<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
					<UploadCloud className="size-6" />
				</span>
			)}
			<span className="text-center">
				<span className="block text-sm font-medium text-foreground/80 group-hover:text-foreground">Click to upload image</span>
				<span className="mt-1 block text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 2MB)</span>
			</span>
			<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
		</button>
	);
}
