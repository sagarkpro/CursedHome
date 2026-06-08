type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
	return classes.filter(Boolean).join(" ");
}

export function splitInHalf<T>(arr: T[]): [T[], T[]] {
	if (arr.length == 1) return [arr, []];
	const mid = arr.length / 2;
	return [arr.slice(0, mid), arr.slice(mid)];
}
