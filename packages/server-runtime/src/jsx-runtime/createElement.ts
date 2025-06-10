import type { Element } from "../types";

export function createElement(
	type: Element["type"],
	props: Element["props"],
	...children: ReadonlyArray<Element>
): Element {
	return {
		type,
		props,
		children: children.length > 1 ? children : children[0],
	};
}
