// Instantiate custom elements
import "..";
import {
	awaitUpdateSignal,
	createMockSignalJSON,
	waitForElementToBeRemoved,
} from "./helpers";
import { SignalText } from "../signal-html";
import { describe, expect, test, beforeEach } from "vitest";
import { signalStore } from "../core";

describe("signal-text", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test('document.createElement("signal-text") is a SignalText instance', () => {
		const element = document.createElement("signal-text");
		expect(element.constructor).toBe(SignalText);
	});

	test("properly subscribes to a signal from the id in the JSON parameter", async () => {
		const element = new SignalText();

		const initialText = "foobar";
		const [signal, configJSON] = createMockSignalJSON(initialText);
		element.setAttribute("value", configJSON);
		await element.connectedCallback();

		expect((element as any).value).toBe(signal);

		const nextText = "testing for update";
		await awaitUpdateSignal(signal, nextText);

		expect(signal()).toBe(nextText);
		expect(element.innerText).toEqual(nextText);
	});

	test("will still work on non-signal JSONs of functions", async () => {});
});
