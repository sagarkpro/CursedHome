import { useAuth0 } from "@auth0/auth0-react";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore, type UserInfo } from "@/store/authStore";

function getInitials(info: UserInfo): string {
	const first = info.given_name?.[0] ?? "";
	const last = info.family_name?.[0] ?? "";
	if (first || last) return (first + last).toUpperCase();

	const name = info.name?.trim();
	if (name) {
		const parts = name.split(/\s+/);
		const a = parts[0]?.[0] ?? "";
		const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
		return (a + b).toUpperCase();
	}

	return (info.email?.[0] ?? "?").toUpperCase();
}

export default function UserProfile() {
	const { logout } = useAuth0();
	const userInfo = useAuthStore((s) => s.userInfo);
	const reset = useAuthStore((s) => s.reset);

	if (!userInfo) return null;

	const displayName = userInfo.name ?? userInfo.email ?? "Account";

	function handleLogout() {
		reset();
		logout({ logoutParams: { returnTo: window.location.origin } });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="min-w-24 flex items-center gap-2 rounded-full p-1.5 pr-2 transition-colors bg-background/20 backdrop-blur-3xl hover:bg-foreground/15 focus:outline-none">
					<Avatar className="size-10">
						<AvatarImage src={userInfo.picture} alt={displayName} />
						<AvatarFallback className="bg-indigo-500/20 font-semibold text-indigo-300">{getInitials(userInfo)}</AvatarFallback>
					</Avatar>
					<div className="hidden flex-col items-start leading-tight sm:flex">
						<span className="text-sm font-semibold text-foreground">{displayName}</span>
						<span className="text-xs text-foreground/70">{userInfo.role}</span>
					</div>
					<ChevronDown className="size-4 text-muted-foreground" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={8} className="w-60">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="text-sm font-semibold text-foreground">{displayName}</span>
					{userInfo.email && <span className="truncate text-xs font-normal text-muted-foreground">{userInfo.email}</span>}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={handleLogout}>
					<LogOut />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
