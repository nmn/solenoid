import { createSignal, signalStore } from "./core";
import type { Signal } from "./utils/types";

export class LetSignal<T> extends HTMLElement {
	static observedAttributes = ["name", "initial-value"];

	private name?: string;
	private signal?: Signal<T | null>;
	initialValue?: T | null;

	connectedCallback() {
		const name = this.getAttribute("name");
		if (!name) {
			throw new Error("let-signal must have a name attribute");
		}

		this.name = name;
		this.initialValue = JSON.parse(
			this.getAttribute("initial-value") || "null",
		) as T | null;
		this.signal = createSignal(this.name, this.initialValue);
		signalStore.set(this.name, this.signal);
	}

	// This should never happen, but keeping it for completeness
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (this.signal == null) {
			return;
		}
		if (name === "name") {
			signalStore.delete(oldValue);
			this.name = newValue;
			signalStore.set(this.name, this.signal);
		}

		if (name === "initial-value") {
			const initialValue = JSON.parse(newValue);
			this.signal(initialValue);
		}
	}

	getSignal(): undefined | Signal<T | null> {
		if (this.signal == null) {
			const initialValue = this.initialValue;
			if (this.name != null && initialValue !== undefined) {
				this.signal = createSignal(this.name, initialValue as T | null);
				signalStore.set(this.name, this.signal);
			}
		}
		return this.signal;
	}

	disconnectedCallback() {
		signalStore.delete(this.name!);
	}
}

customElements.define("let-signal", LetSignal);
