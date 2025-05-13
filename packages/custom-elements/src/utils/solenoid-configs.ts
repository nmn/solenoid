import type { signal } from "alien-signals";

type DefaultFunc = (...args: any[]) => any;

// Make this whatever unique value you want
export const SOLENOID_CUSTOM_KEY = '____solenoid' as const;

export enum SOLENOID_OBJECT_TYPES {
  Function,
  Signal,
};

interface SolenoidConfig<T extends SOLENOID_OBJECT_TYPES = SOLENOID_OBJECT_TYPES> {
  __type: T;
}

type SolenoidObject<T extends SolenoidConfig<SOLENOID_OBJECT_TYPES> = SolenoidConfig<SOLENOID_OBJECT_TYPES>> = {
  [key in typeof SOLENOID_CUSTOM_KEY]: T; 
}

// ---------------------------------------------------

// Solenoid Functions
export interface SolenoidFunctionConfig extends SolenoidConfig<SOLENOID_OBJECT_TYPES.Function> {
  module: string; // "/static/fns/jkshfkjsf.js"
  closure: unknown[];
  args?: unknown[];
};

export type SolenoidFunction<T extends DefaultFunc = DefaultFunc> = T & SolenoidObject<SolenoidFunctionConfig>;

// ---------------------------------------------------

// Solenoid Signals
export type Signal<T> = ReturnType<typeof signal<T>>;

export interface SolenoidSignalConfig extends SolenoidConfig<SOLENOID_OBJECT_TYPES.Signal> {
  id: string;
};

export type SolenoidSignal<T> = Signal<T> & SolenoidObject<SolenoidSignalConfig>;

// ---------------------------------------------------

// Functional code to extract configs, predicates, etc.

export function getSolenoidConfigFromValue<T extends SolenoidObject<SolenoidConfig>>(value: T): T[typeof SOLENOID_CUSTOM_KEY] {
  return value[SOLENOID_CUSTOM_KEY];
}

export function isSolenoidObject(value: unknown): value is SolenoidObject<SolenoidConfig> {
  if (value == null || typeof value !== 'function') {
    return false;
  }

  if (!(SOLENOID_CUSTOM_KEY in value)) {
    return false;
  }

  return true;
}


export function isSolenoidFunction(value: unknown): value is SolenoidFunction<DefaultFunc> {
  if (!isSolenoidObject(value)) {
    return false;
  }

  const config = getSolenoidConfigFromValue<SolenoidObject>(value);

  if (config.__type !== SOLENOID_OBJECT_TYPES.Function) {
    return false;
  }

  return true;
}


export function isSolenoidSignal(value: unknown): value is SolenoidSignal<DefaultFunc> {
  if (!isSolenoidObject(value)) {
    return false;
  }

  const config = getSolenoidConfigFromValue<SolenoidObject>(value);

  if (config.__type !== SOLENOID_OBJECT_TYPES.Signal) {
    return false;
  }

  return true;
}
 
function solenize<T extends DefaultFunc, U extends SolenoidFunctionConfig>(value: T, config: U): SolenoidFunction<T>;
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
