import {
	type AnyFunction,
	type SolenoidSignalConfig,
	type Signal,
	SOLENOID_OBJECT_TYPES,
	SOLENOID_CUSTOM_KEY,
	type SolenoidFunctionConfig,
} from "../utils/types";
import { waitFor } from "@testing-library/dom";
import { expect, vi, type Mock } from "vitest";
import { createSignal, signalStore } from "../core";
import { effect, effectScope } from "alien-signals";

export function waitForElement(element: HTMLElement) {
	return waitFor(() => expect(element.isConnected).toBe(true));
}

export function randomString() {
	return Math.random().toString(36).slice(2);
}

export function waitForElementToBeRemoved(element: HTMLElement) {
	return waitFor(() => expect(element.parentNode).toBeNull());
}

export function createMockFunctionJSON<T extends () => unknown>(
	fn: T,
): [Mock<T>, string] {
	let id: string;
	do {
		id = randomString();
	} while (window.__FNS__[id] != null);

	const config: SolenoidFunctionConfig = {
		[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function,
		id,
		module: id,
		closure: [],
		toJSON: undefined as unknown as SolenoidFunctionConfig["toJSON"],
	};

	const mockFn = vi.fn(fn);

	window.__FNS__[id] = () => mockFn;

	return [mockFn, JSON.stringify(config)];
}

export function createMockSignalJSON<T>(initialValue: T): [Signal<T>, string] {
	let id: string;
	do {
		id = randomString();
	} while (signalStore.get(id) != null);

	const config: SolenoidSignalConfig = {
		[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Signal,
		id,
	};

	const signal = createSignal(id, initialValue);

	signalStore.set(id, signal);

	return [signal, JSON.stringify(config)];
}

export async function awaitRepaint() {
	await new Promise((resolve) => requestAnimationFrame(resolve));
}

export async function awaitUpdateSignal<T>(
	signal: Signal<T>,
	nextVal: T,
): Promise<void> {
	const { promise, resolve } = Promise.withResolvers();

	let initialized = false;
	const unsub = effectScope(() => {
		effect(() => {
			signal();
			// The first execution will be for subscription sake.
			if (initialized) {
				resolve();
				return;
			}
			initialized = true;
		});
	});

	signal(nextVal);
	await promise;
	unsub();
	await awaitRepaint();
}
