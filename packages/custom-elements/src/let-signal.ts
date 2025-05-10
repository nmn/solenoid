import { parseAttributeValue } from "./utils/parse-attribute-value";
import { type Signal, createSignal, signalStore } from "./core";

export class LetSignal<T> extends HTMLElement {
  static observedAttributes = ["name", "initial-value"];
  
  ready = false;
  signal: Signal<T>;
  name: string;
  
  constructor() {
    super();
    
    const name = this.getAttribute("name");
    if (!name) {
      throw new Error("let-signal must have a name attribute");
    }
    this.name = name;

    const initialValue = JSON.parse(this.getAttribute("initial-value") || "null");
    this.signal = createSignal(name, initialValue);
    signalStore.set(this.name, this.signal);
  }

  // connectedCallback() {}

  // This should never happen, but keeping it for completeness
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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

  disconnectedCallback() {
    signalStore.delete(this.name);
  }
}
