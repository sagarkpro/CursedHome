import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createShortcut, deleteShortcut, getDefaultShortcuts, getShortcuts, reorderShortcut, unwrap, updateShortcut, uploadShortcutImage, validateImage, type ShortcutPayload, type ShortcutReorder } from "@/api/personalization.api";
import type { SiteData } from "@/models/SiteData";

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

	// Reorder is optimistic: we relocate the dragged card in the cache immediately
	// (within its own type, leaving the other type's slots untouched) so the grid
	// doesn't snap back while the request is in flight. Roll back on error.
	const reorder = useMutation({
		mutationFn: async (dto: ShortcutReorder) => unwrap(await reorderShortcut(dto)),
		onMutate: async ({ id, prev }) => {
			await qc.cancelQueries({ queryKey: SHORTCUTS_KEY });
			const key = [...SHORTCUTS_KEY, isAuthenticated] as const;
			const prevList = qc.getQueryData<SiteData[]>(key);
			if (!prevList) return undefined;

			const moved = prevList.find((s) => s.id === id);
			if (!moved) return { key, prevList };

			const without = prevList.filter((s) => s.type === moved.type && s.id !== id);
			const pi = prev == null ? -1 : without.findIndex((s) => s.id === prev);
			const at = prev == null ? 0 : pi < 0 ? without.length : pi + 1;
			const newSub = [...without.slice(0, at), moved, ...without.slice(at)];

			// Slot-substitution: refill only this type's positions in original order.
			let i = 0;
			const optimistic = prevList.map((s) => (s.type === moved.type ? newSub[i++] : s));
			qc.setQueryData(key, optimistic);
			return { key, prevList };
		},
		onError: (e: Error, _vars, ctx) => {
			if (ctx) qc.setQueryData(ctx.key, ctx.prevList);
			toast.error(e.message);
		},
		onSuccess: () => toast.success("Shortcuts reordered"),
		onSettled: () => invalidate(),
	});

	return { query, create, update, remove, uploadImage, reorder };
}
