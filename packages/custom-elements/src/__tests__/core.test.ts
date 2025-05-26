import { describe, expect, test, afterEach, vi } from "vitest";
import delay from "delay";
import { createSignal, signalStore } from "../core";

describe("core", () => {
	describe("signalStore", () => {
		afterEach(() => {
			signalStore.clear();
		});

		test("is the same one set on window", () => {
			expect((window as any).signalStore).toBe(signalStore);
		});

		test("awaitGet will wait until a signal is actually set", async () => {
			const key = "foo";

			const spy = vi.fn();
			const promise = signalStore.awaitGet(key);
			promise.then(spy);

			// wait for the next tick to ensure awaitGet gets a chance to run
			await delay(0);
			expect(spy).not.toHaveBeenCalled();

			const signal = createSignal(key, null);
			expect(signalStore.set(key, signal)).not.toBeNull();

			await promise;
			expect(spy).toHaveBeenCalledExactlyOnceWith(signal);
		});
	});
});
