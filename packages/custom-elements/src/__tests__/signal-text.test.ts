// Instantiate custom elements
import "..";
import {
	awaitRepaint,
	awaitUpdateSignal,
	createMockFunctionJSON,
	createMockSignalJSON,
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

		Object.defineProperty(element, "isConnected", {
			get: () => true,
		});

		await element.connectedCallback();
		await awaitRepaint();

		expect(element.innerText).toEqual(initialText);

		const nextText = "testing for update";
		await awaitUpdateSignal(signal, nextText);

		expect(element.innerText).toEqual(nextText);
	});

	test("will still work on non-signal JSONs of functions", async () => {
		const element = new SignalText();

		const initialText = "foobar";
		const [signalLike, configJSON] = createMockFunctionJSON(
			(_?: string) => initialText,
		);
		element.setAttribute("value", configJSON);

		Object.defineProperty(element, "isConnected", {
			get: () => true,
		});

		await element.connectedCallback();
		await awaitRepaint();

		expect(element.innerText).toBe(initialText);
		expect(signalLike).toHaveBeenCalledTimes(1);
	});

	test("unsubscribes to a signal after disconnection", async () => {
		const element = new SignalText();

		const initialText = "foobar";
		const [signal, configJSON] = createMockSignalJSON(initialText);
		element.setAttribute("value", configJSON);

		Object.defineProperty(element, "isConnected", {
			get: () => true,
		});

		await element.connectedCallback();
		await awaitRepaint();

		expect(element.innerText).toEqual(initialText);

		element.disconnectedCallback();
		signal.mockClear();

		const nextText = "testing for update";
		await awaitUpdateSignal(signal, nextText);
		expect(signal).not.toHaveBeenCalled();

		expect(element.innerText).toEqual(initialText);
	});
});
