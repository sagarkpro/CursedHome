interface CardData {
	name: string;
	image?: string;
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
				<img className="my-auto rounded-xl object-cover" src={siteData.image} alt={siteData.name} width={224} height={224} />
			</div>
			<div className="font-bold md:text-lg my-4">{siteData.name}</div>
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
