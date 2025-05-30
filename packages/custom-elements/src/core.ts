import { signal } from "alien-signals";
import {
	isSolenoidFunction,
	isSolenoidSignal,
	type Signal,
} from "./utils/types";

export type {Signal};

declare const window: {
	__FNS__: Record<string, (...args: any[]) => any>;
	signalStore: SignalStore;
};

const hydrateJSON = async (value: unknown): Promise<unknown> => {
	if (Array.isArray(value)) {
		return await Promise.all(value.map(hydrateJSON));
	}

	if (typeof value === "object" && value !== null) {
		if (isSolenoidFunction(value)) {
			const fnObj = value;
			const fnPromise = window.__FNS__[fnObj.module] ?? import(fnObj.module);
			const closurePromises = Promise.all(fnObj.closure.map(hydrateJSON));

			const [fn, closure] = await Promise.all([fnPromise, closurePromises]);
			return (...args: any[]) => fn(...closure)(...args);
		}
		if (isSolenoidSignal(value)) {
			const signalObj = value;
			return await signalStore.awaitGet(signalObj.id);
		}

		const patchPromises = Object.entries(value).map(async ([key, val]) => {
			const patch = await hydrateJSON(val);
			return [key, patch];
		});
		const patchedEntries = await Promise.all(patchPromises);
		return Object.fromEntries(patchedEntries);
	}

	return value;
};

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
};

export function createSignal<T>(id: string, initialValue: T): Signal<T> {
	return signal(initialValue);
}

class SignalStore {
	private store = new Map<string, Signal<any>>();
	private resolvers = new Map<string, (value: any) => void>();

	get(id: string) {
		return this.store.get(id);
	}
	set(id: string, value: Signal<any>) {
		return this.store.set(id, value);
	}
	delete(id: string) {
		return this.store.delete(id);
	}
	clear() {
		this.store.clear();
	}
	keys() {
		return this.store.keys();
	}
	values() {
		return this.store.values();
	}
	entries() {
		return this.store.entries();
	}
	forEach(
		callback: (
			value: Signal<any>,
			key: string,
			map: Map<string, Signal<any>>,
		) => void,
	) {
		this.store.forEach(callback);
	}
	async awaitGet(id: string): Promise<Signal<any>> {
		const signal = this.store.get(id);
		if (signal == null) {
			const { promise, resolve, reject: _reject } = Promise.withResolvers();
			this.resolvers.set(id, resolve);
			return (await promise) as any;
		}
		return signal;
	}
}

export const signalStore = new SignalStore();

window.signalStore = signalStore;
