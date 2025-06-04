export function createSignal<T>(
	initialValue: T | (() => T),
): (() => T) & ((newValue: T) => void) {
	return () =>
		// @ts-ignore
		typeof initialValue === "function" ? initialValue() : initialValue;
}
