import { Element } from "../types";

export function createElement(
	type: Element["type"],
	{ children, ...props }: Element["props"],
) {
	const childArr =
		children != null && !Array.isArray(children) ? [children] : children;
	return new Element(type, props, childArr);
}

export const jsx = createElement;
export const jsxs = createElement;
export const jsxDEV = createElement;
