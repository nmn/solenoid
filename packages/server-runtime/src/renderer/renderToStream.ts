import type { Element } from "../types";
import { ForEach } from "../components/ForEach";
import { Suspense } from "../components/Suspense";
import { When } from "../components/When";

export let currentID = "_0";
let signalIndex = 0;
export function useSignalIndex() {
	return signalIndex++;
}

let currentSignalDefs: string[] = [];
export function addSignalDef(def: string) {
	currentSignalDefs.push(def);
}

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

export async function* renderToStream(
	el: Element | (() => unknown) | string,
	id = "0",
	queue: Promise<string>[] = [],
	inSuspense = false,
	fnsSoFar: string[] = [],
): AsyncGenerator<string, string | undefined, unknown> {
	currentID = id;
	signalIndex = 0;

	if (typeof el === "string") {
		yield el;
		return;
	}

	if (typeof el === "function") {
		const result = el();
		const stringified = JSON.stringify(el);
		yield `<signal-text value='${stringified}'>${result}</signal-text>`;
		return;
	}

	if (typeof el.type === "function") {
		let result = el.type({ ...el.props, children: el.children });
		for (const def of currentSignalDefs) {
			yield def;
		}
		currentSignalDefs = [];
		if (result != null && typeof result === "object" && "then" in result) {
			result = await result;
		}
		yield* renderToStream(result, `${id}_${0}`, queue, inSuspense, fnsSoFar);
		return;
	}

	if (typeof el.type === "string") {
		const children = el.children;
		const fnProps = Object.entries(el.props).filter(
			([key, prop]) => typeof prop === "function",
		);
		const basicProps = Object.entries(el.props)
			.filter(([key, prop]) => typeof prop !== "function")
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

		if (fnProps.length !== 0) {
			const fnsDefs = fnProps
				.filter(([_key, prop]) => !fnsSoFar.includes(prop.id))
				.map(
					([_key, prop]) =>
						`window.__FNS__[${JSON.stringify(String(prop.id))}] = ${prop.module};`,
				)
				.join("\n");
			yield `<script>\n${fnsDefs}\n</script>`;
			yield `<signal-attrs value='${JSON.stringify(Object.fromEntries(fnProps))}'>`;
		}

		if (children == null || children.length === 0) {
			yield openingTag + closingTag;
			return;
		}
		yield openingTag;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			yield* renderToStream(
				child as any,
				`${id}_${i}`,
				queue,
				inSuspense,
				fnsSoFar,
			);
		}
		yield closingTag;

		if (fnProps.length !== 0) {
			yield "</signal-attrs>";
		}

		return;
	}
}
