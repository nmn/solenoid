import type { Element } from "../types";
import { ForEach } from "../components/ForEach";
import { Suspense } from "../components/Suspense";
import { When } from "../components/When";

export let currentID = "0";

// biome-ignore lint/correctness/useYield: It'll be used eventually
export async function* renderToStream(
	el: Element,
	id = "0",
	queue: Promise<string>[] = [],
	inSuspense = false,
) {
	currentID = id;
	if (typeof el.type === "string") {
		const fnProps = Object.entries(el.props).filter(
			([key, prop]) => typeof prop === "function",
		);
		const basicProps = Object.entries(el.props)
			.filter(([key, prop]) => typeof prop !== "function")
			.map(([key, val]) => ` ${key}="${String(val)}"`)
			.join("");
		const openingTag = `<${el.type}${basicProps}>`;
		const closingTag = `</${el.type}>`;

		if (fnProps.length === 0) {
		}
	}
}
