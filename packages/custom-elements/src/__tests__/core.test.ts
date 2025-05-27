import type { SolenoidFunctionConfig } from "../utils/types";

import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import delay from "delay";
import { createSignal, JSON_PARSE, signalStore } from "../core";
import { SOLENOID_CUSTOM_KEY, SOLENOID_OBJECT_TYPES } from "../utils/types";

describe("core", () => {
	beforeEach(() => {
		window.__FNS__ = {};
	});

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

	describe("JSON_PARSE", () => {
		test("can hydrate any regular json value", async () => {
			const values = [
				{},
				{ foo: "bar", "foo-bar": null },
				["a", "b", { c: true }],
				100,
				null,
			] as any[];
			const jsonStrs = values.map((v) => JSON.stringify(v)) as string[];

			const results = await Promise.all(jsonStrs.map((str) => JSON_PARSE(str)));
			expect(results).toStrictEqual(values);
		});

		test("can hydrate a solenoid function config", async () => {
			const moduleName = "bar";
			const fakeModuleWithClosure = vi.fn(
				(...args: string[]) =>
					(...args2: string[]) => [...args, ...args2],
			);
			window.__FNS__[moduleName] = fakeModuleWithClosure;

			const closure = ["a", "b", "c"];

			const config: Omit<SolenoidFunctionConfig, "toJSON"> = {
				[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function,
				module: moduleName,
				id: "",
				closure,
			};

			const stringifiedConfig = JSON.stringify(config);
			const res = await JSON_PARSE(stringifiedConfig);

			expect(res).toBeTypeOf("function");

			const local = ["d", "e", "f"];
			expect(res(...local)).toEqual([...closure, ...local]);
			expect(fakeModuleWithClosure).toHaveBeenCalledExactlyOnceWith(...closure);
		});

		// test('can hydrate solenoid signal config', async ()=>{});

		// test('can hydrate nested solenoid configs', ()=>{

		// });

		// test('errors if object is like a solenoid config but with an invalid value', ()=>{

		// });

		// test('can properly turn a solenoid config back into a real value', ()=>{

		// });
	});
});
