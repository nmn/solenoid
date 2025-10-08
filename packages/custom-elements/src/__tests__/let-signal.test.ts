// Instantiate custom elements
import "..";
import { randomString } from "./helpers";
import { LetSignal } from "../let-signal";
import { describe, expect, test, beforeEach } from "vitest";
import { signalStore } from "../core";

describe("let-signal", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test('document.createElement("let-signal") is a LetSignal instance', () => {
		const element = document.createElement("let-signal");
		expect(element.constructor).toBe(LetSignal);
	});

	test("initializes a signal by the id passed to it, deletes it after unmount", async () => {
		// initialization
		const name = randomString();
		const initialValue = 0;
		const element = new LetSignal<typeof initialValue>();

		element.setAttribute("name", name);
		element.setAttribute("initial-value", JSON.stringify(initialValue));

		// placement
		element.connectedCallback();

		const signal = signalStore.get(name);
		expect(signal).not.toBeNull();
		expect(signal!()).toBe(initialValue);
		expect(element.getSignal()).toBe(signal);

		// removal
		element.disconnectedCallback();
		expect(signalStore.get(name)).toBe(undefined);
	});

	test("falls back to `null` if the initial value is not set", async () => {
		const name = randomString();
		const element = new LetSignal<null>();

		element.setAttribute("name", name);

		element.connectedCallback();

		const signal = signalStore.get(name);
		expect(signal).not.toBeNull();
		expect(signal!()).toBe(null);
	});
});
