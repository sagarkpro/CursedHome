import { Plus } from "lucide-react";
import SiteComponent from "./SiteComponent";
import { splitInHalf } from "../Utils/common";
import type { SiteData } from "../models/SiteData";

interface ShortcutGridProps {
	sites: SiteData[];
	onEdit: (site: SiteData) => void;
	onDelete: (site: SiteData) => void;
	onAdd: () => void;
}

export default function ShortcutGrid({ sites, onEdit, onDelete, onAdd }: ShortcutGridProps) {
	const [leftSites, rightSites] = splitInHalf(sites);

	return (
		<div className="w-full flex flex-col md:flex-row">
			<div id="left-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
				{leftSites.map((site) => (
					<div key={site.id} className="m-4">
						<SiteComponent siteData={site} href={site.url} onEdit={() => onEdit(site)} onDelete={() => onDelete(site)} />
					</div>
				))}
			</div>
			<div className="hidden md:block w-1/3"></div>
			<div id="right-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
				{rightSites.map((site) => (
					<div key={site.id} className="m-4">
						<SiteComponent siteData={site} href={site.url} onEdit={() => onEdit(site)} onDelete={() => onDelete(site)} />
					</div>
				))}
				<div className="m-4">
					<button onClick={onAdd} className="flex flex-col items-center hover:cursor-pointer" title="Add shortcut">
						<div className="rounded-[2rem] w-28 md:w-40 h-28 md:h-40 p-5 bg-background/20 backdrop-blur-xl border-2 border-dashed border-foreground/20 hover:border-foreground/40 transition-all duration-300 flex items-center justify-center">
							<Plus className="size-10 text-foreground/70" />
						</div>
						<div className="font-bold md:text-lg my-4">Add</div>
					</button>
				</div>
			</div>
		</div>
	);
}
