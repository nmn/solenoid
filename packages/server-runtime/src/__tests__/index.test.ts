import { isSolenoidFunction } from "@solenoid/custom-elements/dist/utils/types";
import { describe, expect, test } from "vitest";
import { serializableFn } from "..";

describe("server-runtime", () => {
	describe("serializableFn", () => {
		test("works on overloaded functions", () => {
			function build<T extends string>(param: T): { str: T };
			function build<T extends number>(param: T): { num: T };
			function build<T extends string | number>(param: T) {
				if (typeof param === "string") {
					return { str: param };
				}
				return { num: param };
			}

			const numParam = 3;
			expect(
				serializableFn({
					fn: () => build,
					closure: (): [] => [],
					id: "",
				})(numParam).num,
			).toBe(numParam);

			const stringParam = "foo";
			expect(
				serializableFn({
					fn: () => build,
					closure: (): [] => [],
					id: "",
				})(stringParam).str,
			).toBe(stringParam);
		});

		test("result evaluates correctly to a solenoid function", () => {
			const fn = serializableFn({
				fn: () => () => null,
				closure: (): [] => [],
				id: "",
			});

			// This is broken since currently we only do typeof var === 'object'
			expect(isSolenoidFunction(fn)).toBe(true);
		});
	});
});
