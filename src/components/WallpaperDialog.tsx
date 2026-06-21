import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
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
	onAdd: (url: string) => void;
	onRemove: (url: string) => void;
	/** Uploads the picked wallpaper and resolves with its hosted URL. */
	onUploadImage: (file: File) => Promise<string>;
}

export default function WallpaperDialog({ open, onOpenChange, wallpapers, activeWallpaper, onSelect, onAdd, onRemove, onUploadImage }: WallpaperDialogProps) {
	const [newUrl, setNewUrl] = useState("");

	function handleAdd() {
		const url = newUrl.trim();
		if (!url) return;
		onAdd(url);
		setNewUrl("");
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
						<div className="grid max-h-64 grid-cols-2 gap-3 gap-y-6 overflow-y-auto sm:grid-cols-3">
							{wallpapers.map((url) => {
								const isActive = url === activeWallpaper;
								return (
									<button
										key={url}
										type="button"
										onClick={() => onSelect(url)}
										className={cn(
											"group relative aspect-video overflow-hidden rounded-lg border border-border outline-none transition-all hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50",
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
												onRemove(url);
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
								type="url"
								placeholder="https://images.unsplash.com/..."
								value={newUrl}
								onChange={(e) => setNewUrl(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleAdd();
								}}
							/>
							<Button type="button" variant="outline" onClick={handleAdd}>
								<Plus />
								Add
							</Button>
						</div>
						<ImageUploadField onUpload={onUploadImage} onUploaded={(url) => onAdd(url)} helperText="PNG, JPG, GIF, WEBP or BMP up to 10MB" />
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="ghost">Cancel</Button>
					</DialogClose>
					<Button onClick={() => onOpenChange(false)}>Done</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
