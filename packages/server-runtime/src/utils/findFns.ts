import {
	type AnyFunction,
	type SolenoidFunctionConfig,
	type SolenoidSignalConfig,
	SOLENOID_CUSTOM_KEY,
	SOLENOID_OBJECT_TYPES,
} from "@solenoid/custom-elements/src/utils/types";

export const findFns = (value: unknown): SolenoidFunctionConfig[] => {
	if (Array.isArray(value)) {
		return value.flatMap(findFns);
	}

	if (
		(typeof value === "object" && value !== null) ||
		typeof value === "function"
	) {
		if (isSolenoidFunction(value)) {
			const subFns = value.closure.flatMap(findFns);
			return [...subFns, value];
		}
		if (isSolenoidSignal(value)) {
			return findFns(value.id);
		}
	}

	return [];
};

function isSolenoidFunction(value: object): value is SolenoidFunctionConfig {
	// @ts-ignore
	return value[SOLENOID_CUSTOM_KEY] === SOLENOID_OBJECT_TYPES.Function;
}

function isSolenoidSignal(value: object): value is SolenoidSignalConfig {
	// @ts-ignore
	return value[SOLENOID_CUSTOM_KEY] === SOLENOID_OBJECT_TYPES.Signal;
}
