import { Edit2, Trash2 } from "lucide-react";
import { getFallbackImageUrl } from "../Utils/common";

interface CardData {
	name: string;
	image?: string;
}

interface SiteComponentProps {
	siteData: CardData;
	href?: string;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

function CardBody({ siteData, withFallback }: { siteData: CardData; withFallback: boolean }) {
	return (
		<>
			<div className="rounded-[2rem] w-28 md:w-40 h-28 md:h-40 p-5 hover:p-3 bg-background/20 backdrop-blur-xl transition-all duration-300 overflow-hidden flex">
				<img
					className="my-auto rounded-xl object-cover"
					src={withFallback ? siteData.image || getFallbackImageUrl(siteData.name) : siteData.image}
					alt={siteData.name}
					width={224}
					height={224}
					onError={
						withFallback
							? (e) => {
									const img = e.currentTarget;
									const fallback = getFallbackImageUrl(siteData.name);
									if (img.src !== fallback) img.src = fallback;
								}
							: undefined
					}
				/>
			</div>
			<div className="font-bold md:text-lg my-4">{siteData.name}</div>
		</>
	);
}

function CardActions({ onEdit, onDelete }: { onEdit?: () => void; onDelete?: () => void }) {
	const stop = (handler: () => void) => (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		handler();
	};

	return (
		<div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 -translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 ease-out">
			{onEdit && (
				<button onClick={stop(onEdit)} className="p-2 bg-black/60 hover:bg-black text-zinc-300 hover:text-white rounded-full backdrop-blur-md transition-colors" title="Edit">
					<Edit2 className="w-4 h-4" />
				</button>
			)}
			{onDelete && (
				<button onClick={stop(onDelete)} className="p-2 bg-black/60 hover:bg-red-500/80 text-zinc-300 hover:text-white rounded-full backdrop-blur-md transition-colors" title="Delete">
					<Trash2 className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}

function SiteComponent({ siteData, href, onClick, onEdit, onDelete }: SiteComponentProps) {
	const showActions = Boolean(onEdit || onDelete);

	return (
		<div className="relative group flex flex-col items-center">
			{showActions && <CardActions onEdit={onEdit} onDelete={onDelete} />}
			{onClick ? (
				<button className="flex flex-col items-center hover:cursor-pointer" onClick={onClick}>
					<CardBody siteData={siteData} withFallback={showActions} />
				</button>
			) : (
				<a className="flex flex-col items-center hover:cursor-pointer" href={href} target="_blank">
					<CardBody siteData={siteData} withFallback={showActions} />
				</a>
			)}
		</div>
	);
}

export default SiteComponent;
