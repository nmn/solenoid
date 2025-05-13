import { signal } from "alien-signals";
import { SOLENOID_OBJECT_TYPES, type SolenoidSignal } from "./utils/solenoid-config-types";
import { getSolenoidConfigFromValue, isSolenoidObject, isSolenoidFunction, isSolenoidSignal, solenize } from "./utils/solenoid-config-helpers";

// declare const TEffect: unique symbol;
// const EFFECT = Symbol("EFFECT") as typeof TEffect;

declare const window: {
  __FNS__: Record<string, (...args: any[]) => any>;
  signalStore: SignalStore;
};

const hydrateJSON = async (value: unknown) => {
  if (Array.isArray(value)) {
    return await Promise.all(value.map(hydrateJSON));
  }

  if (typeof value === "object" && value !== null) {
    if (isSolenoidObject(value)) {
      if (isSolenoidFunction(value)) {
        const fnObj = getSolenoidConfigFromValue(value);
        const fnPromise = window.__FNS__[fnObj.module] ?? import(fnObj.module);
        const closurePromises = Promise.all(fnObj.closure.map(hydrateJSON));
        const argsPromises = Promise.all(fnObj.args?.map(hydrateJSON) ?? []);

        const [fn, closure, boundArgs] = await Promise.all([fnPromise, closurePromises, argsPromises]);
        return (...args: any[]) =>
          fn(...closure)(...boundArgs, ...args);
      }
      if (isSolenoidSignal(value)) {
        const signalObj = getSolenoidConfigFromValue(value);
        return await signalStore.awaitGet(signalObj.id);
      }
    }

    const patchPromises = Object.entries(value).map(async ([key, val]) => {
      const patch = await hydrateJSON(val);
      return [key, patch];
    });
    const patchedEntries = await Promise.all(patchPromises);
    return Object.fromEntries(patchedEntries);
  }

  return value;
}

// Ideally, it would be nice to ensure that JSON parse
// returned the same reference for any nested array or object
const cache = new Map<string, any>();
export const JSON_PARSE = async (value: string) => {
  const cached = cache.get(value);
  if (cached) {
    return cached;
  }
  const parsed = JSON.parse(value);
  const hydratedValue = await hydrateJSON(parsed);
  cache.set(value, hydratedValue);
  return hydratedValue;
}


export function createSignal<T>(id: string, initialValue: T): SolenoidSignal<T> {
  const s = signal(initialValue);

  return solenize(s, {__type: SOLENOID_OBJECT_TYPES.Signal, id});
}


class SignalStore {
  store = new Map<string, SolenoidSignal<any>>();
  resolvers = new Map<string, ((value: any) => void)>();

  get(id: string) {
    return this.store.get(id);
  }
  set(id: string, value: SolenoidSignal<any>) {
    return this.store.set(id, value)
  }
  delete(id: string) {
    return this.store.delete(id)
  }
  clear() {
    this.store.clear()
  }
  keys() {
    return this.store.keys()
  }
  values() {
    return this.store.values()
  }
  entries() {
    return this.store.entries()
  }
  forEach(callback: (value: SolenoidSignal<any>, key: string, map: Map<string, SolenoidSignal<any>>) => void) {
    this.store.forEach(callback);
  }
  async awaitGet(id: string): Promise<SolenoidSignal<any>> {
    const signal = this.store.get(id);
    if (signal == null) {
      const {promise, resolve, reject} = Promise.withResolvers()
      this.resolvers.set(id, resolve);
      return await promise as any;
    }
    return signal;
  }
}

export const signalStore = new SignalStore();

window.signalStore = signalStore;
