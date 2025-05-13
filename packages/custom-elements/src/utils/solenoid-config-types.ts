import type { signal } from "alien-signals";

export const SOLENOID_CUSTOM_KEY = '____solenoid' as const;

export enum SOLENOID_OBJECT_TYPES {
  Function,
  Signal,
};

// ---------------------------------------------------

// Base types

export interface SolenoidConfig<T extends SOLENOID_OBJECT_TYPES = SOLENOID_OBJECT_TYPES> {
  __type: T;
}

export type SolenoidObject<T extends SolenoidConfig<SOLENOID_OBJECT_TYPES> = SolenoidConfig<SOLENOID_OBJECT_TYPES>, U extends object = object> = U & {
  [key in typeof SOLENOID_CUSTOM_KEY]: T; 
}

// ---------------------------------------------------

// Functions

type DefaultFunc = (...args: any[]) => any;

export interface SolenoidFunctionConfig extends SolenoidConfig<SOLENOID_OBJECT_TYPES.Function> {
  module: string; // "/static/fns/jkshfkjsf.js"
  closure: unknown[];
  args?: unknown[];
};

export type SolenoidFunction<T extends DefaultFunc = DefaultFunc> = SolenoidObject<SolenoidFunctionConfig, T>;

// ---------------------------------------------------

// Signals

export type Signal<T> = ReturnType<typeof signal<T>>;

export interface SolenoidSignalConfig extends SolenoidConfig<SOLENOID_OBJECT_TYPES.Signal> {
  id: string;
};

export type SolenoidSignal<T = any> = SolenoidObject<SolenoidSignalConfig, Signal<T>>;

// ---------------------------------------------------
