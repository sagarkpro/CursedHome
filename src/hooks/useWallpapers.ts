import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDefaultWallpapers, getWallpapers, unwrap, updateWallpapers, uploadWallpaperImage, validateImage } from "@/api/personalization.api";

const WALLPAPERS_KEY = ["wallpapers"] as const;

/**
 * Wallpapers query + mutations. Logged-in users hit `/wallpapers`; logged-out
 * fall back to the public `/wallpapers/default`. `updateWallpapers` is a
 * full-list replace, so callers send the complete set they want to end up with.
 */
export function useWallpapers(isAuthenticated: boolean) {
	const qc = useQueryClient();

	const query = useQuery({
		queryKey: [...WALLPAPERS_KEY, isAuthenticated],
		queryFn: () => (isAuthenticated ? getWallpapers() : getDefaultWallpapers()).then(unwrap),
	});

	const update = useMutation({
		mutationFn: async (urls: string[]) => unwrap(await updateWallpapers(urls)),
		onSuccess: () => qc.invalidateQueries({ queryKey: WALLPAPERS_KEY }),
		onError: (e: Error) => toast.error(e.message),
	});

	const uploadImage = useMutation({
		mutationFn: async (file: File) => {
			validateImage(file, { maxMB: 10 });
			return unwrap(await uploadWallpaperImage(file));
		},
		onError: (e: Error) => toast.error(e.message),
	});

	return { query, update, uploadImage };
}
