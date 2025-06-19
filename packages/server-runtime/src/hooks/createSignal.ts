import {
	addSignalDef,
	currentID,
	useSignalIndex,
} from "../renderer/renderToStream";

export function createSignal<T>(
	initialValue: T | (() => T),
): (() => T) & ((newValue: T) => void) {
	const id = currentID;
	const index = useSignalIndex();
	const valueFn = () =>
		// @ts-ignore
		typeof initialValue === "function" ? initialValue() : initialValue;

	valueFn.__type = "$$SIGNAL";
	valueFn.id = `${id}-${index}`;
	valueFn.toJSON = () => ({
		__type: "$$SIGNAL",
		id: `${id}-${index}`,
	});

	addSignalDef(
		`<let-signal id="${valueFn.id}" initial-value='${JSON.stringify(valueFn())}'></let-signal>`,
	);

	return valueFn;
}
