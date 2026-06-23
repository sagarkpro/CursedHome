import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadField from "@/components/ImageUploadField";
import { cn } from "@/lib/utils";

interface WallpaperDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	wallpapers: string[];
	activeWallpaper: string;
	onSelect: (url: string) => void;
	/** Persists the edited wallpaper list (full-list replace). Called on Save. */
	onSave: (urls: string[]) => void;
	/** True while the save request is in flight — drives the Save button's loading state. */
	saving: boolean;
	/** Uploads the picked wallpaper and resolves with its hosted URL. */
	onUploadImage: (file: File) => Promise<string>;
}

export default function WallpaperDialog({ open, onOpenChange, wallpapers, activeWallpaper, onSelect, onSave, saving, onUploadImage }: WallpaperDialogProps) {
	const [newUrl, setNewUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	// Local draft of the list — edits stage here and only persist on Save.
	const [draft, setDraft] = useState<string[]>(wallpapers);

	// Re-seed the draft from the committed list on each open transition. Adjusting
	// state during render (React's documented pattern) avoids an effect + extra paint.
	const [wasOpen, setWasOpen] = useState(open);
	if (open !== wasOpen) {
		setWasOpen(open);
		if (open) {
			setDraft(wallpapers);
			setNewUrl("");
			setError(null);
		}
	}

	const dirty = draft.length !== wallpapers.length || draft.some((u, i) => u !== wallpapers[i]);

	function addUrl(url: string) {
		setDraft((d) => (d.includes(url) ? d : [...d, url]));
	}

	function handleAdd() {
		const raw = newUrl.trim();
		if (!raw) return;

		if (raw.startsWith("[")) {
			let parsed: unknown;
			try {
				parsed = JSON.parse(raw);
			} catch {
				setError("Invalid JSON array");
				return;
			}
			if (!Array.isArray(parsed)) {
				setError("JSON must be an array");
				return;
			}
			const urls = parsed.filter((u): u is string => typeof u === "string" && u.trim() !== "");
			if (urls.length === 0) {
				setError("No valid URLs in the array");
				return;
			}
			setDraft((d) => {
				const merged = [...d];
				for (const u of urls) if (!merged.includes(u)) merged.push(u);
				return merged;
			});
		} else {
			addUrl(raw);
		}

		setNewUrl("");
		setError(null);
	}

	function handleRemove(url: string) {
		setDraft((d) => d.filter((w) => w !== url));
	}

	function reset() {
		setDraft(wallpapers);
		setNewUrl("");
		setError(null);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Customize Wallpaper</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-2">
					<div className="flex flex-col gap-2">
						<Label>Wallpapers</Label>
						<div className="flex max-h-64 flex-wrap gap-3 p-2 overflow-y-auto">
							{draft.map((url) => {
								const isActive = url === activeWallpaper;
								return (
									<button
										key={url}
										type="button"
										onClick={() => onSelect(url)}
										className={cn(
											"group relative aspect-video basis-[calc(50%-0.375rem)] overflow-hidden rounded-lg border border-border outline-none transition-all hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 sm:basis-[calc(33.333%-0.5rem)]",
											isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
										)}
									>
										<img src={url} alt="Wallpaper" className="size-full object-cover" />
										{isActive && (
											<span className="absolute bottom-1 left-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
												<Check className="size-3" />
											</span>
										)}
										<span
											role="button"
											tabIndex={-1}
											onClick={(e) => {
												e.stopPropagation();
												handleRemove(url);
											}}
											className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
											title="Remove"
										>
											<X className="size-3" />
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="wallpaper-url">Add wallpaper</Label>
						<div className="flex gap-2">
							<Input
								id="wallpaper-url"
								type="text"
								placeholder={'https://... or ["url1","url2"]'}
								value={newUrl}
								onChange={(e) => {
									setNewUrl(e.target.value);
									if (error) setError(null);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAdd();
								}}
							/>
							<Button type="button" variant="outline" onClick={handleAdd}>
								<Plus />
								Add
							</Button>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<ImageUploadField onUpload={onUploadImage} onUploaded={(url) => addUrl(url)} helperText="PNG, JPG, GIF, WEBP or BMP up to 10MB" />
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost" onClick={reset}>
							Cancel
						</Button>
					</DialogClose>
					<Button onClick={() => onSave(draft)} disabled={saving || !dirty}>
						{saving && <Loader2 className="animate-spin" />}
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
