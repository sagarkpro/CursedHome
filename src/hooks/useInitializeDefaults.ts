import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initializeDefaults, unwrap } from "@/api/personalization.api";

/**
 * Seeds the opinionated default personalization (shortcuts + wallpapers) for a
 * logged-in user. The backend wipes any existing personalization first, so this
 * is only offered when both lists are already empty.
 *
 * On success it invalidates both query families by prefix — matching the keys
 * used in useShortcuts/useWallpapers — so the grid and wallpapers repopulate
 * without a reload.
 */
export function useInitializeDefaults() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async () => unwrap(await initializeDefaults()),
		onSuccess: () => {
			toast.success("Default profile created");
			qc.invalidateQueries({ queryKey: ["wallpapers"] });
			qc.invalidateQueries({ queryKey: ["shortcuts"] });
		},
		onError: (e: Error) => toast.error(e.message),
	});
}
