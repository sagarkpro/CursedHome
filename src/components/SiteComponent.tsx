interface CardData {
	Title: string;
	ImageUrl: string;
	Height?: number;
	Width?: number;
}

interface SiteComponentProps {
	siteData: CardData;
	href?: string;
	onClick?: () => void;
}

function SiteComponent({ siteData, href, onClick }: SiteComponentProps) {
	const inner = (
		<>
			<div className="rounded-4xl w-28 md:w-40 h-28 md:h-40 p-5 hover:p-1 bg-background/20 backdrop-blur-xl transition-all duration-300 overflow-hidden flex">
				<img className="my-auto rounded-xl object-cover" src={siteData.ImageUrl} alt={siteData.Title} width={siteData.Width ?? 224} height={siteData.Height ?? 224} />
			</div>
			<div className="font-bold md:text-lg my-4">{siteData.Title}</div>
		</>
	);

	if (onClick) {
		return (
			<button className="flex flex-col items-center hover:cursor-pointer" onClick={onClick}>
				{inner}
			</button>
		);
	}

	return (
		<a className="flex flex-col items-center hover:cursor-pointer" href={href} target="_blank">
			{inner}
		</a>
	);
}

export default SiteComponent;
