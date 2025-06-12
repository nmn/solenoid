import type { Element } from "../types";
import { ForEach } from "../components/ForEach";
import { Suspense } from "../components/Suspense";
import { When } from "../components/When";

export let currentID = "0";

const selfClosingTags = [
	"img",
	"br",
	"area",
	"base",
	"br",
	"col",
	"deprecated",
	"embed",
	"hr",
	"img",
	"input",
	"deprecated",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"only",
];

// biome-ignore lint/correctness/useYield: It'll be used eventually
export async function* renderToStream(
	el: Element,
	id = "0",
	queue: Promise<string>[] = [],
	inSuspense = false,
) {
	currentID = id;
	if (typeof el.type === "string") {
		const children = el.props.children;
		const fnProps = Object.entries(el.props).filter(
			([key, prop]) => typeof prop === "function" && key !== "children",
		);
		const basicProps = Object.entries(el.props)
			.filter(([key, prop]) => typeof prop !== "function" && key !== "children")
			.map(([key, val]) => ` ${key}="${String(val)}"`)
			.join("");

		let openingTag = `<${el.type}${basicProps}>`;
		let closingTag = `</${el.type}>`;

		if (
			selfClosingTags.includes(el.type) &&
			fnProps.find(([key]) => key === "children") == null
		) {
			openingTag = `<${el.type}${basicProps} />`;
			closingTag = "";
		}

		if (fnProps.length === 0) {
			return openingTag + closingTag;
		}
	}
}
