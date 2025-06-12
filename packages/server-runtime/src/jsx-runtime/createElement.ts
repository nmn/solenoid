import { Element } from "../types";

export function createElement(
	type: Element["type"],
	props: Element["props"],
	...children: ReadonlyArray<Element>
) {
	return new Element(type, props, children.length > 1 ? children : children[0]);
}
