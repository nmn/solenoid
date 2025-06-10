// Instantiate custom elements
import "..";
import userEvent from "@testing-library/user-event";
import {
	awaitRepaint,
	awaitUpdateSignal,
	createMockFunctionJSON,
	createMockSignalJSON,
} from "./helpers";
import { SignalAttrs } from "../signal-html";
import { describe, expect, test, beforeEach, vi } from "vitest";
import { signalStore } from "../core";
import { signal } from "alien-signals";

describe("signal-attrs", () => {
	beforeEach(() => {
		window.__FNS__ = {};
		signalStore.clear();
		document.body.innerHTML = "";
	});

	test('document.createElement("signal-attrs") is a SignalAttrs instance', () => {
		const element = document.createElement("signal-attrs");
		expect(element.constructor).toBe(SignalAttrs);
	});

	test("properly subscribes to a signal from the id in the JSON parameter", async () => {
		const element = document.createElement("signal-attrs") as SignalAttrs;
		const button = document.createElement("button");
		element.append(button);

		const mockClicked1 = vi.fn();
		const [signal, signalJSON] = createMockSignalJSON({
			onClick: mockClicked1,
		});
		element.setAttribute("value", signalJSON);

		await element.connectedCallback();
		await awaitRepaint();

		await userEvent.click(button);

		expect(mockClicked1).toHaveBeenCalledTimes(1);
		mockClicked1.mockClear();

		const mockClicked2 = vi.fn();
		await awaitUpdateSignal(signal, { onClick: mockClicked2 });
		await awaitRepaint();

		await userEvent.click(button);
		expect(mockClicked2).toHaveBeenCalledTimes(1);
		expect(mockClicked1).not.toHaveBeenCalled();
	});

	test("will still work on non-signal JSONs of functions", async () => {
		const element = document.createElement("signal-attrs") as SignalAttrs;
		const button = document.createElement("button");
		element.append(button);

		const mockClicked1 = vi.fn();
		const [fn, fnJson] = createMockFunctionJSON(() => ({
			onClick: mockClicked1,
		}));
		element.setAttribute("value", fnJson);

		await element.connectedCallback();
		await awaitRepaint();
		expect(fn).toHaveBeenCalledTimes(1);

		await userEvent.click(button);

		expect(mockClicked1).toHaveBeenCalledTimes(1);
		mockClicked1.mockClear();

		element.disconnectedCallback();

		await userEvent.click(button);
		expect(mockClicked1).not.toHaveBeenCalled();
	});

	test("unsubscribes to a signal after disconnection", async () => {
		const element = document.createElement("signal-attrs") as SignalAttrs;
		const button = document.createElement("button");
		element.append(button);

		const mockClicked1 = vi.fn();
		const [signal, signalJSON] = createMockSignalJSON({
			onClick: mockClicked1,
		});
		element.setAttribute("value", signalJSON);

		await element.connectedCallback();
		await awaitRepaint();

		await userEvent.click(button);

		expect(mockClicked1).toHaveBeenCalledTimes(1);
		mockClicked1.mockClear();

		element.disconnectedCallback();

		const mockClicked2 = vi.fn();
		await awaitUpdateSignal(signal, { onClick: mockClicked2 });
		await awaitRepaint();

		await userEvent.click(button);
		expect(mockClicked2).not.toHaveBeenCalled();
		expect(mockClicked1).not.toHaveBeenCalled();
	});

	test("can update attributes on a signal change", async () => {
		const element = document.createElement("signal-attrs") as SignalAttrs;
		const div = document.createElement("div") as HTMLDivElement;
		element.append(div);

		const signalBool = signal(true);
		const attribCheck = "data-check";
		const trueResult = "abc";
		const falseResult = "xyz";
		const [fn, fnJSON] = createMockFunctionJSON(() => ({
			[attribCheck]: signalBool() ? trueResult : falseResult,
		}));

		element.setAttribute("value", fnJSON);

		// ensure static attributes are unchanged
		div.dataset["foo"] = "bar";

		// ensure pointers are unchanged
		const ptr = Symbol("ptr");
		(div as any).__ptr = ptr;

		await element.connectedCallback();
		await awaitRepaint();

		expect(fn).toHaveBeenCalledTimes(1);
		fn.mockClear();

		expect(div.dataset["foo"]).toEqual("bar");
		expect((div as any).__ptr).toBe(ptr);
		expect(div.getAttribute(attribCheck)).toBe(trueResult);

		await awaitUpdateSignal(signalBool, false);
		await awaitRepaint();

		expect(fn).toHaveBeenCalledTimes(1);
		fn.mockClear();
		expect(div.getAttribute(attribCheck)).toBe(falseResult);

		element.disconnectedCallback();

		await awaitUpdateSignal(signalBool, true);
		await awaitRepaint();

		expect(fn).not.toHaveBeenCalled();
		expect(div.getAttribute(attribCheck)).toBe(falseResult);
	});
});
