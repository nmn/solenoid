/**
 * Not very well-documented yet, but this follows the syntax set by Typescript/Babel
 * https://www.typescriptlang.org/docs/handbook/jsx.html#the-jsx-namespace
 * https://babeljs.io/docs/babel-plugin-transform-react-jsx#importsource
 **/

import type { HtmlTags } from "html-tags";
import type { SolenoidExclusiveHtmlTags } from "@solenoid/custom-elements/lib/html-tags";
type Tag = SolenoidExclusiveHtmlTags | HtmlTags;

function jsx(tag: Tag, props: Readonly<Record<string, string>>): Element {
	const element = document.createElement(tag);

	for (const key in props) {
		const v = props[key];

		if (key === "children") {
			element.append(v);
			continue;
		}

		element.setAttribute(key, v);
	}

	return element;
}

export { jsx, jsx as jsxs, jsx as jsxDEV };

type IntrinsicElementsMap = {
	[K in Tag]: any;
};
type El = Element;

declare global {
	namespace JSX {
		interface IntrinsicElements extends IntrinsicElementsMap {}
		interface Element extends El {}
	}
}
