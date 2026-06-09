import { useState } from "react";
import SiteComponent from "./components/SiteComponent";
import Firefox from "./components/Firefox";
import type { ViewType } from "./models/ViewType";
import ToolsWrapper from "./components/ToolsWrapper";
import { sites } from "./constants/SiteDataConstants";
import { tools } from "./constants/ToolDataConstants";
import LocalhostPortLauncher from "./components/LocalhostPortLauncher";
import { cn, splitInHalf } from "./Utils/common";
import { useAuth0 } from "@auth0/auth0-react";
import UserProfile from "./components/UserProfile";

export default function Home() {
	const tabs: ViewType[] = ["shortcuts", "repositories", "tools"];
	const [leftSites, rightSites] = splitInHalf(sites);
	const [leftTools, rightTools] = splitInHalf(tools);
	const [currentView, setCurrentView] = useState<ViewType>("shortcuts");
	const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
	const [isAnime, setIsAnime] = useState<boolean>(() => {
		const stored = localStorage.getItem("isAnime");
		return stored ? JSON.parse(stored) : false;
	});
	const translateX = isAnime ? "2.5rem" : "0px";
	const buttonImage = getSliderImage();
	const backgroundImage = getBackgroundImage();

	function changeTheme() {
		localStorage.setItem("isAnime", JSON.stringify(!isAnime));
		setIsAnime(!isAnime);
	}

	function getSliderImage(): string {
		return "bg-[url(/images/ichigo.jpg)]";
	}

	function getBackgroundImage(): string {
		return "bg-[url(/images/makima2.png)]";
	}

	return (
		<div className={`w-full h-svh overflow-clip bg-cover bg-center ${isAnime ? backgroundImage : "bg-black"}`}>
			<div className={`w-full h-full overflow-y-scroll overflow-x-clip flex flex-col items-center p-8`}>
				<div className="gap-x-4 md:gap-0 mx-2 w-full flex items-center flex-wrap md:flex-nowrap justify-between px-6 md:px-0">
					<div className="flex justify-center">
						<Firefox></Firefox>
					</div>

					<div className="flex w-full md:w-max justify-between md:justify-normal">
						<div className="flex items-center justify-end md:px-3">
							<button className="rounded-full bg-zinc-50 text-black p-1 w-[5.5rem]" onClick={changeTheme}>
								<div className={`rounded-[5rem] w-10 h-10 transition-all duration-150 bg-cover bg-center ${isAnime ? buttonImage : "bg-black"}`} style={{ transform: `translateX(${translateX})` }}></div>
							</button>
						</div>
						<div className="flex items-center justify-end">
							{isLoading ? null : isAuthenticated ? (
								<UserProfile />
							) : (
								<button onClick={() => loginWithRedirect()} className="px-6 py-2 bg-rose-300 hover:bg-rose-200 rounded-3xl text-xl text-background font-semibold hover:cursor-pointer">
									Login
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="w-full max-w-screen-md my-5 bg-foreground rounded-3xl flex justify-between text-background p-1 font-semibold">
					{tabs.map((tab) => {
						return (
							<button onClick={() => setCurrentView(tab)} key={`${tab}-switch`} className={cn("px-6 py-1 hover:bg-rose-200 rounded-3xl", currentView === tab && "bg-rose-300")}>
								{tab.toUpperCase()}
							</button>
						);
					})}
				</div>

				{currentView === "shortcuts" && (
					<div className="w-full flex flex-col md:flex-row">
						<div id="left-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
							{leftSites.map((site) => (
								<div key={site.Title} className="m-4">
									<SiteComponent siteData={site} href={site.RedirectUrl} />
								</div>
							))}
						</div>
						<div className="hidden md:block w-1/3"></div>
						<div id="right-content-div" className="flex max-w-screen-2xl flex-wrap justify-center">
							{rightSites.map((site) => (
								<div key={site.Title} className="m-4">
									<SiteComponent siteData={site} href={site.RedirectUrl} />
								</div>
							))}
						</div>
					</div>
				)}
				{currentView === "tools" && (
					<div className="w-full flex flex-col md:flex-row">
						<div className="flex max-w-screen-2xl flex-wrap justify-center">
							<ToolsWrapper tools={leftTools} />
						</div>
						<div className="hidden md:block w-1/3"></div>
						<div className="flex max-w-screen-2xl flex-wrap justify-center">
							<ToolsWrapper tools={rightTools} />
						</div>
					</div>
				)}
				{currentView === "repositories" && (
					<div className="w-full flex flex-wrap justify-center">
						<p className="text-muted-foreground mt-16">Repositories coming soon.</p>
					</div>
				)}
			</div>
			<LocalhostPortLauncher />
		</div>
	);
}
