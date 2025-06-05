// Instantiate custom elements
import "..";
import {
	randomString,
	waitForElement,
	waitForElementToBeRemoved,
} from "./helpers";
import { LetSignal } from "../let-signal";
import { describe, expect, test, beforeEach } from "vitest";
import { signalStore } from "../core";

describe("let-signal", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test("initializes a signal by the id passed to it, deletes it after unmount", async () => {
		// initialization
		const name = randomString();
		const initialValue = 0;
		const element = document.createElement("let-signal") as LetSignal<
			typeof initialValue
		>;
		expect(element).toBeInstanceOf(LetSignal);

		element.setAttribute("name", name);
		element.setAttribute("initial-value", JSON.stringify(initialValue));

		// placement
		document.body.append(element);
		await waitForElement(element);

		const signal = signalStore.get(name);
		expect(signal).not.toBeNull();
		expect(signal!()).toBe(initialValue);
		expect(element.getSignal()).toBe(signal);

		// removal
		document.body.removeChild(element);
		await waitForElementToBeRemoved(element);
		expect(signalStore.get(name)).toBe(undefined);
	});

	test("falls back to `null` if the initial value is not set or an empty string", async () => {
		const name = randomString();
		const element = document.createElement("let-signal") as LetSignal<null>;
		expect(element).toBeInstanceOf(LetSignal);

		element.setAttribute("name", name);
		element.setAttribute("initial-value", "");

		document.body.append(element);
		await waitForElement(element);

		const signal = signalStore.get(name);
		expect(signal).not.toBeNull();
		expect(signal!()).toBe(null);
	});
});
