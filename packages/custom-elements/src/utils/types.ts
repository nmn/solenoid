import type { signal } from "alien-signals";

declare const SOLENOID_CUSTOM_KEY_SYMBOL: unique symbol;

type T_SOLENOID_SYMBOL = typeof SOLENOID_CUSTOM_KEY_SYMBOL;

export const SOLENOID_CUSTOM_KEY: T_SOLENOID_SYMBOL = "__type" as any;

export enum SOLENOID_OBJECT_TYPES {
	Function = "$$FUNCTION",
	Signal = "$$SIGNAL",
	Global = "$$GLOBAL",
}

// ---------------------------------------------------

export type SolenoidFunctionConfig<Closure extends any[] = any[]> = {
	[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function;
	id: string;
	module: string;
	closure: Closure;
	toJSON: () => Record<string, any>;
};

export type SolenoidSignalConfig = {
	[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Signal;
	id: string;
};

export type SolenoidGlobalNameConfig = {
	[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Global;
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
