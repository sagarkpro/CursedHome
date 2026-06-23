import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/components/ImageUploadField";
import SiteComponent from "@/components/SiteComponent";
import type { ShortcutFormValues, ShortcutType, SiteData } from "@/models/SiteData";

interface ShortcutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Present => edit mode, null/undefined => add mode. */
	shortcut?: SiteData | null;
	/** Noun shown in the title/submit button, e.g. "Shortcut" or "Repository". */
	entityLabel?: string;
	/** Seeds the Type select in add mode (edit mode uses the shortcut's own type). */
	defaultType?: ShortcutType;
	onSubmit: (values: ShortcutFormValues) => void;
	/** Uploads the picked icon and resolves with its hosted URL. */
	onUploadImage: (file: File) => Promise<string>;
}

export default function ShortcutDialog({ open, onOpenChange, shortcut, entityLabel = "Shortcut", defaultType = "WEB", onSubmit, onUploadImage }: ShortcutDialogProps) {
	const isEdit = Boolean(shortcut);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isEdit ? `Edit ${entityLabel}` : `Add New ${entityLabel}`}</DialogTitle>
				</DialogHeader>
				{/* Keyed so the form reseeds whenever the target shortcut changes. */}
				<ShortcutForm
					key={shortcut?.id ?? "new"}
					initial={shortcut}
					isEdit={isEdit}
					entityLabel={entityLabel}
					defaultType={defaultType}
					onUploadImage={onUploadImage}
					onSubmit={(values) => {
						onSubmit(values);
						onOpenChange(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

function ShortcutForm({ initial, isEdit, entityLabel, defaultType, onSubmit, onUploadImage }: { initial?: SiteData | null; isEdit: boolean; entityLabel: string; defaultType: ShortcutType; onSubmit: (values: ShortcutFormValues) => void; onUploadImage: (file: File) => Promise<string> }) {
	const [values, setValues] = useState<ShortcutFormValues>({
		name: initial?.name ?? "",
		url: initial?.url ?? "",
		image: initial?.image ?? "",
		type: initial?.type ?? defaultType,
	});

	function update<K extends keyof ShortcutFormValues>(key: K, value: ShortcutFormValues[K]) {
		setValues((prev) => ({ ...prev, [key]: value }));
	}

	return (
		<>
			<div className="flex flex-col gap-4 py-2">
				<div className="flex flex-col gap-2">
					<Label>Icon / Image</Label>
					<ImageUploadField
						value={values.image}
						onUpload={onUploadImage}
						onUploaded={(url) => update("image", url)}
						helperText="PNG, JPG, GIF, WEBP or BMP up to 5MB"
						preview={values.image ? <SiteComponent siteData={{ name: values.name || "Preview", image: values.image }} withFallback /> : undefined}
					/>
					<Input type="url" placeholder="...or paste an image URL" value={values.image ?? ""} onChange={(e) => update("image", e.target.value)} />
				</div>

				<div className="flex gap-4">
					<div className="flex flex-1 flex-col gap-2">
						<Label htmlFor="shortcut-type">Type</Label>
						<Select value={values.type} onValueChange={(v) => update("type", v as ShortcutType)}>
							<SelectTrigger id="shortcut-type" className="w-full data-[size=default]:h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="WEB">Web</SelectItem>
								<SelectItem value="REPOSITORY">Repository</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-1 flex-col gap-2">
						<Label htmlFor="shortcut-name">Name</Label>
						<Input id="shortcut-name" placeholder="e.g. ChatGPT" value={values.name} onChange={(e) => update("name", e.target.value)} />
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="shortcut-url">URL</Label>
					<Input id="shortcut-url" type="url" placeholder="https://..." value={values.url} onChange={(e) => update("url", e.target.value)} />
				</div>
			</div>

			<DialogFooter>
				<DialogClose asChild>
					<Button variant="ghost">Cancel</Button>
				</DialogClose>
				<Button onClick={() => onSubmit(values)}>{isEdit ? "Save Changes" : `Add ${entityLabel}`}</Button>
			</DialogFooter>
		</>
	);
}
