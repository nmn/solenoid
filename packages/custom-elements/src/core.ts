import { signal } from "alien-signals";

declare const TFunction: unique symbol;
const FUNCTION = Symbol("FUNCTION") as typeof TFunction;

declare const TSignal: unique symbol;
const SIGNAL = Symbol("SIGNAL") as typeof TSignal;

// declare const TEffect: unique symbol;
// const EFFECT = Symbol("EFFECT") as typeof TEffect;
export type SignalSerialized = {
  __type: typeof SIGNAL;
  id: string;
};
export type Signal<T> = ReturnType<typeof signal<T>>;
export type ServerSignal<T> = Signal<T> & SignalSerialized;

export type Function = {
  __type: typeof FUNCTION;
  module: string;
  closure: unknown[];
  args?: unknown[];
};

const hydrateJSON = async (value: unknown) => {
  if (Array.isArray(value)) {
    return await Promise.all(value.map(hydrateJSON));
  }

  if (typeof value === "object" && value !== null) {
    if ('__type' in value) {
      if (value.__type === FUNCTION || value.__type === '$$FUNCTION') {
        const fnObj = value as Function;
        const fnPromise = import(fnObj.module);
        const closurePromises = Promise.all(fnObj.closure.map(hydrateJSON));
        const argsPromises = Promise.all(fnObj.args?.map(hydrateJSON) ?? []);

        const [fn, closure, boundArgs] = await Promise.all([fnPromise, closurePromises, argsPromises]);
        return (...args: any[]) =>
          fn(...closure)(...boundArgs, ...args);
      }
      if (value.__type === SIGNAL || value.__type === '$$SIGNAL') {
        const signalObj = value as SignalSerialized;
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


export function createSignal<T>(id: string, initialValue: T): Signal<T> {
  const s = signal(initialValue);
  // @ts-ignore
  s.__type = SIGNAL;
  // @ts-ignore
  s.id = id;

  return s as Signal<T>;
}


class SignalStore {
  store = new Map<string, Signal<any>>();
  resolvers = new Map<string, ((value: any) => void)>();

  get(id: string) {
    return this.store.get(id);
  }
  set(id: string, value: Signal<any>) {
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
  forEach(callback: (value: Signal<any>, key: string, map: Map<string, Signal<any>>) => void) {
    this.store.forEach(callback);
  }
  async awaitGet(id: string): Promise<Signal<any>> {
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
