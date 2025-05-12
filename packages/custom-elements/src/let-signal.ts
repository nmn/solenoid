import { type Signal, createSignal, signalStore } from "./core";

export class LetSignal<T> extends HTMLElement {
  static observedAttributes = ["name", "initial-value"];

  ready = false;
  signal: Signal<T>;
  name: string;
  initialValue: T;

  connectedCallback() {
    const name = this.getAttribute("name");
    if (!name) {
      throw new Error("let-signal must have a name attribute");
    }

    this.name = name;
    this.initialValue = JSON.parse(this.getAttribute("initial-value") || "null");
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

  getSignal(): undefined | Signal<T> {
    if (this.signal == null) {
      if (this.name != null && this.initialValue !== undefined) {
        this.signal = createSignal(this.name, this.initialValue) as any;
        signalStore.set(this.name, this.signal);
      }
    }
    return this.signal;
  }

  disconnectedCallback() {
    signalStore.delete(this.name);
  }
}

customElements.define("let-signal", LetSignal);
