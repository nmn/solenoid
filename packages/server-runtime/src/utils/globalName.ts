import {
	SOLENOID_CUSTOM_KEY,
	SOLENOID_OBJECT_TYPES,
	type SolenoidGlobalNameConfig,
} from "@solenoid/custom-elements/src/utils/types";

type Options = {
	id: SolenoidGlobalNameConfig["id"];
};

export function globalName({ id }: Options): SolenoidGlobalNameConfig {
	return {
		[SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Global,
		id,
	};
}
