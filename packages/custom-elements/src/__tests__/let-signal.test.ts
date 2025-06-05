// Instantiate custom elements
import "..";
import { waitForElement } from "./helpers";
import { LetSignal } from "../let-signal";
import { describe, expect, test, beforeEach } from "vitest";
import { signalStore } from "../core";

describe("let-signal", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test("initializes a signal by the id passed to it", async () => {
		const name = "124132512";
		const initialValue = 0;
		const element = document.createElement("let-signal") as LetSignal<
			typeof initialValue
		>;
		expect(element).toBeInstanceOf(LetSignal);

		element.setAttribute("name", name);
		element.setAttribute("initial-value", JSON.stringify(initialValue));

		document.body.append(element);
		await waitForElement(element);

		const signal = signalStore.get(name);
		expect(signal).not.toBeNull();
		expect(signal!()).toBe(initialValue);
	});

	// test('falls back to `null` if the initial value is not set or an empty string', async ()=>{

	// });
});
