import type { Signal, SolenoidConfig, SolenoidFunction, SolenoidFunctionConfig, SolenoidObject, SolenoidSignal, SolenoidSignalConfig } from "./solenoid-config-types";
import { SOLENOID_CUSTOM_KEY, SOLENOID_OBJECT_TYPES } from "./solenoid-config-types";


export function getSolenoidConfigFromValue<T extends SolenoidObject>(value: T): T[typeof SOLENOID_CUSTOM_KEY] {
  return value[SOLENOID_CUSTOM_KEY];
}

export function isSolenoidObject(value: unknown): value is SolenoidObject {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  if (!(SOLENOID_CUSTOM_KEY in value)) {
    return false;
  }

  return true;
}

export function isSolenoidFunction(value: unknown): value is SolenoidFunction {
  if (!isSolenoidObject(value)) {
    return false;
  }

  const config = getSolenoidConfigFromValue(value);

  if (config.__type !== SOLENOID_OBJECT_TYPES.Function) {
    return false;
  }

  return true;
}


export function isSolenoidSignal(value: unknown): value is SolenoidSignal {
  if (!isSolenoidObject(value)) {
    return false;
  }

  const config = getSolenoidConfigFromValue(value);

  if (config.__type !== SOLENOID_OBJECT_TYPES.Signal) {
    return false;
  }

  return true;
}
 
function solenize<T extends (...args: any[])=>any, U extends SolenoidFunctionConfig>(value: T, config: U): SolenoidFunction<T>;
function solenize<T extends any, U extends SolenoidSignalConfig>(value: Signal<T>, config: U): SolenoidSignal<T>;
function solenize<T = any, U extends SolenoidConfig = SolenoidConfig>(value: T, config: U): T & SolenoidObject<U> {
  Object.defineProperty(value, SOLENOID_CUSTOM_KEY, {
    value: config,
    configurable: false,
    writable: false,
    enumerable: false,
  });

  return value as T & SolenoidObject<U>;
}

export {solenize};
