import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createShortcut, deleteShortcut, getDefaultShortcuts, getShortcuts, unwrap, updateShortcut, uploadShortcutImage, validateImage, type ShortcutPayload } from "@/api/personalization.api";

const SHORTCUTS_KEY = ["shortcuts"] as const;

/**
 * Shortcuts query + mutations. Logged-in users hit `/shortcut`; logged-out fall
 * back to the public `/shortcut/default`. The query key carries `isAuthenticated`
 * so the cache splits the two and refetches across login/logout.
 *
 * Mutations return no data, so each invalidates the query to re-sync the grid.
 */
export function useShortcuts(isAuthenticated: boolean) {
	const qc = useQueryClient();

	const query = useQuery({
		queryKey: [...SHORTCUTS_KEY, isAuthenticated],
		queryFn: () => (isAuthenticated ? getShortcuts() : getDefaultShortcuts()).then(unwrap),
	});

	const invalidate = () => qc.invalidateQueries({ queryKey: SHORTCUTS_KEY });

	const create = useMutation({
		mutationFn: async (dto: ShortcutPayload) => unwrap(await createShortcut(dto)),
		onSuccess: () => {
			toast.success("Shortcut added");
			invalidate();
		},
		onError: (e: Error) => toast.error(e.message),
	});

	const update = useMutation({
		mutationFn: async ({ id, dto }: { id: string; dto: ShortcutPayload }) => unwrap(await updateShortcut(id, dto)),
		onSuccess: () => {
			toast.success("Shortcut updated");
			invalidate();
		},
		onError: (e: Error) => toast.error(e.message),
	});

	const remove = useMutation({
		mutationFn: async (id: string) => unwrap(await deleteShortcut(id)),
		onSuccess: () => {
			toast.success("Shortcut deleted");
			invalidate();
		},
		onError: (e: Error) => toast.error(e.message),
	});

	const uploadImage = useMutation({
		mutationFn: async (file: File) => {
			validateImage(file, { maxMB: 5 });
			return unwrap(await uploadShortcutImage(file));
		},
		onError: (e: Error) => toast.error(e.message),
	});

	return { query, create, update, remove, uploadImage };
}
