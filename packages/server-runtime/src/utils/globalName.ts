import {
	SOLENOID_CUSTOM_KEY,
	SOLENOID_OBJECT_TYPES,
	type SolenoidGlobalNameConfig,
} from "@solenoid/custom-elements/dist/utils/types";

export function globalName({ id }): SolenoidGlobalNameConfig {
	return {
		[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Global,
		id,
	};
}
