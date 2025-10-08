// Instantiate custom elements
import "..";
import {
	awaitRepaint,
	awaitUpdateSignal,
	createMockSignalJSON,
} from "./helpers";
import { ShowWhen } from "../signal-html";
import { describe, expect, test, beforeEach } from "vitest";
import { signalStore } from "../core";

describe("show-when", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test('document.createElement("show-when") is a ShowWhen instance', () => {
		const element = document.createElement("show-when");
		expect(element.constructor).toBe(ShowWhen);
	});

	test("properly subscribes to a signal from the id in the JSON parameter", async () => {
		const element = document.createElement("show-when") as ShowWhen;

		const childElement = document.createElement("div");
		childElement.append("signal test for show when");

		const [signal, configJSON] = createMockSignalJSON(true);
		element.setAttribute("condition", configJSON);
		element.append(childElement);

		Object.defineProperty(element, "isConnected", {
			get: () => true,
		});
		await element.connectedCallback();
		await awaitRepaint();

		expect(Array.from(element.children)).toContainEqual(childElement);

		await awaitUpdateSignal(signal, false);

		expect(Array.from(element.children)).not.toContainEqual(childElement);

		await awaitUpdateSignal(signal, true);

		expect(Array.from(element.children)).toContainEqual(childElement);
	});

	test("unsubscribes to any signals upon disconnection", async () => {
		const element = document.createElement("show-when") as ShowWhen;

		const childElement = document.createElement("div");
		childElement.append("signal test for show when");

		const [signal, configJSON] = createMockSignalJSON(true);
		element.setAttribute("condition", configJSON);
		element.append(childElement);

		await element.connectedCallback();
		await awaitRepaint();

		expect(Array.from(element.children)).toContainEqual(childElement);
		signal.mockClear();

		element.disconnectedCallback();
		await awaitUpdateSignal(signal, false);
		expect(signal).not.toHaveBeenCalled();

		expect(Array.from(element.children)).toContainEqual(childElement);
	});

	test("can handle nested show-when's", async () => {
		const element = document.createElement("show-when") as ShowWhen;
		Object.defineProperty(element, "isConnected", {
			get: () => true,
		});

		const nestedElement = document.createElement("show-when") as ShowWhen;
		Object.defineProperty(nestedElement, "isConnected", {
			get: () => true,
		});

		const childElement = document.createElement("div");
		childElement.append("signal test for nested show when");

		const [nestedSignal, nestedConfigJSON] = createMockSignalJSON(true);
		nestedElement.setAttribute("condition", nestedConfigJSON);
		nestedElement.append(childElement);

		const [signal, configJSON] = createMockSignalJSON(true);
		element.setAttribute("condition", configJSON);
		element.append(nestedElement);

		await element.connectedCallback();
		await nestedElement.connectedCallback();
		await awaitRepaint();

		expect(Array.from(element.children)).toContainEqual(nestedElement);
		expect(Array.from(nestedElement.children)).toContainEqual(childElement);

		await awaitUpdateSignal(nestedSignal, false);
		await awaitRepaint();

		expect(Array.from(element.children)).toContainEqual(nestedElement);
		expect(Array.from(nestedElement.children)).not.toContainEqual(childElement);

		await awaitUpdateSignal(signal, false);
		await awaitRepaint();

		expect(Array.from(element.children)).not.toContainEqual(nestedElement);

		await awaitUpdateSignal(nestedSignal, true);
		await awaitRepaint();

		expect(Array.from(nestedElement.children)).toContainEqual(childElement);

		await awaitUpdateSignal(signal, true);
		await awaitRepaint();

		expect(Array.from(element.children)).toContainEqual(nestedElement);
	});
});
