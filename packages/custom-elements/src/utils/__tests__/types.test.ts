import { describe, expect, test } from "vitest";
import * as types from "../types";

describe("Solenoid types", () => {
	describe("SolenoidObjectTypes", () => {
		const values = Object.values(
			types.SOLENOID_OBJECT_TYPES,
		) as readonly string[];

		test("has no duplicate values", () => {
			const valuesSet = new Set(values);

			expect(valuesSet.size).toBe(values.length);
		});

		test("all values are serializable", () => {
			expect(
				values.map((val) => JSON.stringify(val)).map((val) => JSON.parse(val)),
			).toStrictEqual(values);
		});
	});

	describe("isSolenoidFunction", () => {
		test("returns false whenever SOLENOID_CUSTOM_KEY is omitted", () => {
			const obj = {
				module: "",
				closure: [],
			};

			expect(types.isSolenoidFunction(obj)).toBe(false);

			expect(
				types.isSolenoidFunction({
					...obj,
					[types.SOLENOID_CUSTOM_KEY]: types.SOLENOID_OBJECT_TYPES.Function,
				}),
			).toBe(true);
		});

		test("returns false on bad values", () => {
			const arr = [1, 2, "", null, undefined, {}];
			expect(arr.map(types.isSolenoidFunction)).toStrictEqual(
				arr.map(() => false),
			);
		});
	});
});
