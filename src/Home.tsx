import { useState } from "react";
import Firefox from "./components/Firefox";
import type { ViewType } from "./models/ViewType";
import ToolsWrapper from "./components/ToolsWrapper";
import { tools } from "./constants/ToolDataConstants";
import LocalhostPortLauncher from "./components/LocalhostPortLauncher";
import { cn, splitInHalf } from "./Utils/common";
import { useAuth0 } from "@auth0/auth0-react";
import UserProfile from "./components/UserProfile";
import { ImagePlus, Images } from "lucide-react";
import type { ShortcutFormValues, ShortcutType, SiteData } from "./models/SiteData";
import ShortcutDialog from "./components/ShortcutDialog";
import ShortcutGrid from "./components/ShortcutGrid";
import WallpaperDialog from "./components/WallpaperDialog";
import LoginPromptDialog from "./components/LoginPromptDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import DefaultProfileDialog from "./components/DefaultProfileDialog";
import { useShortcuts } from "./hooks/useShortcuts";
import { useWallpapers } from "./hooks/useWallpapers";
import { useInitializeDefaults } from "./hooks/useInitializeDefaults";

export default function Home() {
	const tabs: ViewType[] = ["shortcuts", "repositories", "tools"];
	const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

	const shortcuts = useShortcuts(isAuthenticated);
	const wallpapers = useWallpapers(isAuthenticated);
	const initDefaults = useInitializeDefaults();
	const allSites = shortcuts.query.data ?? [];
	const webSites = allSites.filter((s) => s.type === "WEB");
	const repoSites = allSites.filter((s) => s.type === "REPOSITORY");
	const wallpaperList = wallpapers.query.data ?? [];

	// Offer the default profile only once both queries have *succeeded* with empty
	// lists — `isSuccess` avoids triggering during the initial fetch or on error.
	const needsDefaults = isAuthenticated && shortcuts.query.isSuccess && wallpapers.query.isSuccess && allSites.length === 0 && wallpaperList.length === 0;

	const [leftTools, rightTools] = splitInHalf(tools);
	const [currentView, setCurrentView] = useState<ViewType>("shortcuts");
	const [isAnime, setIsAnime] = useState<boolean>(() => {
		const stored = localStorage.getItem("isAnime");
		return stored ? JSON.parse(stored) : false;
	});
	const [wallpaper, setWallpaper] = useState<string>(() => localStorage.getItem("wallpaper") ?? "");
	const [shortcutDialogOpen, setShortcutDialogOpen] = useState<boolean>(false);
	const [editingShortcut, setEditingShortcut] = useState<SiteData | null>(null);
	const [addType, setAddType] = useState<ShortcutType>("WEB");
	const [wallpaperDialogOpen, setWallpaperDialogOpen] = useState<boolean>(false);
	const [loginPromptOpen, setLoginPromptOpen] = useState<boolean>(false);
	const [pendingDelete, setPendingDelete] = useState<SiteData | null>(null);
	const [pendingWallpaperRemove, setPendingWallpaperRemove] = useState<string | null>(null);
	const [defaultsDismissed, setDefaultsDismissed] = useState<boolean>(false);

	const translateX = isAnime ? "2.5rem" : "0px";
	const buttonImage = getSliderImage();
	// Fall back to the first available wallpaper when the stored one isn't in the live list.
	const activeWallpaper = wallpaper && wallpaperList.includes(wallpaper) ? wallpaper : wallpaperList[0] ?? "";
	const backgroundImage = activeWallpaper;

	/** Run `action` if logged in, otherwise prompt for login (customization is auth-only). */
	function requireAuth(action: () => void) {
		if (!isAuthenticated) {
			setLoginPromptOpen(true);
			return;
		}
		action();
	}

	function changeTheme() {
		localStorage.setItem("isAnime", JSON.stringify(!isAnime));
		setIsAnime(!isAnime);
	}

	function openAddShortcut(type: ShortcutType) {
		requireAuth(() => {
			setEditingShortcut(null);
			setAddType(type);
			setShortcutDialogOpen(true);
		});
	}

	function handleEditSite(site: SiteData) {
		requireAuth(() => {
			setEditingShortcut(site);
			setShortcutDialogOpen(true);
		});
	}

	function handleDeleteSite(site: SiteData) {
		requireAuth(() => setPendingDelete(site));
	}

	function handleSubmitShortcut(values: ShortcutFormValues) {
		const type: ShortcutType = editingShortcut ? editingShortcut.type : addType;
		if (editingShortcut) {
			shortcuts.update.mutate({ id: editingShortcut.id, dto: { type, ...values } });
		} else {
			shortcuts.create.mutate({ type, ...values });
		}
	}

	// Wallpaper selection is local-only (cosmetic) — allowed for everyone.
	function selectWallpaper(url: string) {
		localStorage.setItem("wallpaper", url);
		setWallpaper(url);
	}

	function cycleWallpaper() {
		if (wallpaperList.length === 0) return;
		const currentIndex = wallpaperList.indexOf(activeWallpaper);
		const next = wallpaperList[(currentIndex + 1) % wallpaperList.length];
		selectWallpaper(next);
	}

	function handleAddWallpaper(url: string) {
		requireAuth(() => wallpapers.update.mutate([...wallpaperList, url]));
	}

	function handleRemoveWallpaper(url: string) {
		requireAuth(() => setPendingWallpaperRemove(url));
	}

	function uploadWallpaperImage(file: File): Promise<string> {
		if (!isAuthenticated) {
			setLoginPromptOpen(true);
			return Promise.reject(new Error("Login required"));
		}
		return wallpapers.uploadImage.mutateAsync(file);
	}

	function getSliderImage(): string {
		return "bg-[url(/images/ichigo.jpg)]";
	}

	return (
		<div className={`w-full h-svh overflow-clip bg-cover bg-center ${isAnime ? "" : "bg-black"}`} style={isAnime ? { backgroundImage: `url(${backgroundImage})` } : undefined}>
			<div className={`w-full h-full overflow-y-scroll overflow-x-clip flex flex-col items-center p-8`}>
				<div className="gap-x-4 md:gap-0 mx-2 w-full flex items-center flex-wrap md:flex-nowrap justify-between px-6 md:px-0">
					<div className="flex justify-center">
						<Firefox></Firefox>
					</div>

					<div className="flex w-full md:w-max justify-between md:justify-normal">
						<div className="flex items-center justify-end gap-2 md:px-3">
							{isAnime && (
								<>
									<button className="rounded-full bg-zinc-50 text-black p-2.5 hover:bg-zinc-200 transition-colors hover:cursor-pointer" onClick={cycleWallpaper} title="Change wallpaper">
										<Images size={20} />
									</button>
									<button className="rounded-full bg-zinc-50 text-black p-2.5 hover:bg-zinc-200 transition-colors hover:cursor-pointer" onClick={() => setWallpaperDialogOpen(true)} title="Customize wallpapers">
										<ImagePlus size={20} />
									</button>
								</>
							)}
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

				<div className={cn("w-max my-5 bg-background/20 backdrop-blur-xl rounded-[5rem] flex justify-between text-background p-1 py-1.5 font-semibold text-sm md:text-base", !isAnime && "bg-background")}>
					{tabs.map((tab) => {
						return (
							<button
								onClick={() => setCurrentView(tab)}
								key={`${tab}-switch`}
								className={cn("mx-0.5 px-4 py-2 rounded-[5rem] transition-all duration-300", currentView === tab ? "bg-rose-400 text-background" : "hover:bg-white/10 text-foreground/85")}
							>
								{tab.toUpperCase()}
							</button>
						);
					})}
				</div>

				{currentView === "shortcuts" && <ShortcutGrid sites={webSites} onEdit={handleEditSite} onDelete={handleDeleteSite} onAdd={() => openAddShortcut("WEB")} />}
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
				{currentView === "repositories" && <ShortcutGrid sites={repoSites} onEdit={handleEditSite} onDelete={handleDeleteSite} onAdd={() => openAddShortcut("REPOSITORY")} />}
			</div>
			<LocalhostPortLauncher />
			<ShortcutDialog
				open={shortcutDialogOpen}
				onOpenChange={setShortcutDialogOpen}
				shortcut={editingShortcut}
				entityLabel={(editingShortcut ? editingShortcut.type : addType) === "REPOSITORY" ? "Repository" : "Shortcut"}
				onSubmit={handleSubmitShortcut}
				onUploadImage={(file) => shortcuts.uploadImage.mutateAsync(file)}
			/>
			<WallpaperDialog
				open={wallpaperDialogOpen}
				onOpenChange={setWallpaperDialogOpen}
				wallpapers={wallpaperList}
				activeWallpaper={activeWallpaper}
				onSelect={selectWallpaper}
				onAdd={handleAddWallpaper}
				onRemove={handleRemoveWallpaper}
				onUploadImage={uploadWallpaperImage}
			/>
			<LoginPromptDialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen} />
			<DefaultProfileDialog
				open={needsDefaults && !defaultsDismissed}
				onOpenChange={(o) => !o && setDefaultsDismissed(true)}
				pending={initDefaults.isPending}
				onConfirm={() => initDefaults.mutate()}
			/>
			<ConfirmDialog
				open={Boolean(pendingDelete)}
				onOpenChange={(o) => !o && setPendingDelete(null)}
				title={`Delete ${pendingDelete?.type === "REPOSITORY" ? "repository" : "shortcut"}?`}
				description={
					<>
						This will permanently remove <strong className="text-foreground">{pendingDelete?.name}</strong>. This can't be undone.
					</>
				}
				pending={shortcuts.remove.isPending}
				onConfirm={() => pendingDelete && shortcuts.remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) })}
			/>
			<ConfirmDialog
				open={Boolean(pendingWallpaperRemove)}
				onOpenChange={(o) => !o && setPendingWallpaperRemove(null)}
				title="Remove wallpaper?"
				description="This removes the wallpaper from your collection. This can't be undone."
				confirmLabel="Remove"
				pending={wallpapers.update.isPending}
				onConfirm={() => pendingWallpaperRemove && wallpapers.update.mutate(wallpaperList.filter((w) => w !== pendingWallpaperRemove), { onSuccess: () => setPendingWallpaperRemove(null) })}
			/>
		</div>
	);
}
