import { useState, type CSSProperties, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SiteComponent from "./SiteComponent";
import { splitInHalf } from "../Utils/common";
import type { SiteData } from "../models/SiteData";
import type { ShortcutReorder } from "@/api/personalization.api";

interface ShortcutGridProps {
	sites: SiteData[];
	onEdit: (site: SiteData) => void;
	onDelete: (site: SiteData) => void;
	onAdd: () => void;
	/** Enable drag-to-reorder. Off for logged-out users (they see public defaults). */
	canReorder?: boolean;
	onReorder?: (dto: ShortcutReorder) => void;
}

/** A single draggable card. Whole card is the drag handle; an 8px activation
 *  constraint (set on the sensors) keeps plain clicks opening the link. */
function SortableSiteCard({ site, onEdit, onDelete }: { site: SiteData; onEdit: () => void; onDelete: () => void }) {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: site.id });
	const style: CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1, // hide the source; the DragOverlay clone follows the cursor
		touchAction: "none",
	};
	return (
		<div ref={setNodeRef} style={style} className="m-4" {...attributes} {...listeners}>
			<SiteComponent siteData={site} href={site.url} onEdit={onEdit} onDelete={onDelete} />
		</div>
	);
}

/** Two-column presentational grid + centered add button. Card rendering is
 *  injected via `renderCard` so it works for both the static and sortable grids. */
function GridLayout({ leftSites, rightSites, renderCard, addButton }: { leftSites: SiteData[]; rightSites: SiteData[]; renderCard: (site: SiteData) => ReactNode; addButton: ReactNode }) {
	const leftUnbalanced = leftSites?.length < rightSites?.length;
	const rightUnbalanced = leftSites?.length > rightSites?.length;

	return (
		<div className="w-full flex flex-col">
			<div className="w-full flex flex-col md:flex-row">
				<div id="left-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
					{leftSites.map(renderCard)}
					{leftUnbalanced && <div className="invisible pointer-events-none">{renderCard(rightSites[0])}</div>}
				</div>
				<div className="hidden md:block w-1/3"></div>
				<div id="right-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
					{rightSites.map(renderCard)}
					{rightUnbalanced && <div className="invisible pointer-events-none">{renderCard(leftSites[0])}</div>}
				</div>
			</div>
			<div className="w-full flex justify-center">{addButton}</div>
		</div>
	);
}

export default function ShortcutGrid({ sites, onEdit, onDelete, onAdd, canReorder = false, onReorder }: ShortcutGridProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const [leftSites, rightSites] = splitInHalf(sites);

	const addButton = (
		<div className="m-4">
			<button onClick={onAdd} className="flex flex-col items-center hover:cursor-pointer" title="Add shortcut">
				<div className="rounded-[2rem] w-28 md:w-40 h-28 md:h-40 p-5 bg-background/20 backdrop-blur-xl border-2 border-dashed border-foreground/20 hover:border-foreground/40 transition-all duration-300 flex items-center justify-center">
					<Plus className="size-10 text-foreground/70" />
				</div>
				<div className="font-bold md:text-lg my-4">Add</div>
			</button>
		</div>
	);

	// Logged-out: original static grid, no drag overhead.
	if (!canReorder) {
		return (
			<GridLayout
				leftSites={leftSites}
				rightSites={rightSites}
				addButton={addButton}
				renderCard={(site) => (
					<div key={site.id} className="m-4">
						<SiteComponent siteData={site} href={site.url} onEdit={() => onEdit(site)} onDelete={() => onDelete(site)} />
					</div>
				)}
			/>
		);
	}

	// The split-array fix: the two columns are presentational only. We compute
	// prev/next against the flat `sites` array (the canonical order), so a drop at
	// the top of the right column correctly resolves prev = left-column tail.
	function handleDragEnd(e: DragEndEvent) {
		setActiveId(null);
		const { active, over } = e;
		if (!over || active.id === over.id) return;
		const oldIndex = sites.findIndex((s) => s.id === active.id);
		const newIndex = sites.findIndex((s) => s.id === over.id);
		if (oldIndex < 0 || newIndex < 0) return;
		const reordered = arrayMove(sites, oldIndex, newIndex);
		const prev = reordered[newIndex - 1]?.id ?? null;
		const next = reordered[newIndex + 1]?.id ?? null;
		onReorder?.({ id: String(active.id), prev, next });
	}

	const activeSite = activeId ? sites.find((s) => s.id === activeId) : null;

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}>
			{/* One SortableContext spans both columns so drags cross the boundary. */}
			<SortableContext items={sites.map((s) => s.id)} strategy={rectSortingStrategy}>
				<GridLayout leftSites={leftSites} rightSites={rightSites} addButton={addButton} renderCard={(site) => <SortableSiteCard key={site.id} site={site} onEdit={() => onEdit(site)} onDelete={() => onDelete(site)} />} />
			</SortableContext>
			<DragOverlay>
				{activeSite && (
					<div className="m-4">
						<SiteComponent siteData={activeSite} href={activeSite.url} />
					</div>
				)}
			</DragOverlay>
		</DndContext>
	);
}
