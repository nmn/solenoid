import type { signal } from "alien-signals";

declare const SOLENOID_CUSTOM_KEY_SYMBOL: unique symbol;

type T_SOLENOID_SYMBOL = typeof SOLENOID_CUSTOM_KEY_SYMBOL;

export const SOLENOID_CUSTOM_KEY: T_SOLENOID_SYMBOL = "__type" as any;

export enum SOLENOID_OBJECT_TYPES {
	Function = "$$FUNCTION",
	Signal = "$$SIGNAL",
}

// ---------------------------------------------------

export type SolenoidFunctionConfig = {
	[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function;
	module: string;
	closure: unknown[];
};

export type SolenoidSignalConfig = {
	[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Signal;
	id: string;
};

export type SolenoidConfigObject =
	| SolenoidSignalConfig
	| SolenoidFunctionConfig;

// ---------------------------------------------------

// Functions

export type AnyFunction = (...args: any[]) => any;

// ---------------------------------------------------

// Signals

export type Signal<T> = ReturnType<typeof signal<T>>;

// ---------------------------------------------------

export function isSolenoidFunction(
	value: unknown,
): value is SolenoidFunctionConfig {
	return (
		value != null &&
		typeof value === "object" &&
		SOLENOID_CUSTOM_KEY in value &&
		value[SOLENOID_CUSTOM_KEY] === SOLENOID_OBJECT_TYPES.Function
	);
}

export function isSolenoidSignal(
	value: unknown,
): value is SolenoidSignalConfig {
	return (
		value != null &&
		typeof value === "object" &&
		SOLENOID_CUSTOM_KEY in value &&
		value[SOLENOID_CUSTOM_KEY] === SOLENOID_OBJECT_TYPES.Signal
	);
}
