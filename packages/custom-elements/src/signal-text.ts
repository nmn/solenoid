// deno-lint-ignore-file no-explicit-any
import { Signal } from "./signal-store";
import { signalStore } from "./signal-store-instance";

export class SignalText extends HTMLElement {
  static observedAttributes = [
    "name",
    "watch"
  ];

  signal: null | Signal<any> = null;
  _signalRegistry: Map<string, Signal<any>>;
  _watch: string | null = null;

  ready = false;
  mounted = false;

  cleanUp: null | (() => void) = null;

  constructor() {
    super();
    this._signalRegistry = window.signalRegistry || signalStore;
  }

  connectedCallback() {
    this.mounted = true;
    const name = this.getAttribute("name");
    this._watch = this.getAttribute("watch") ?? null;
    if (!name) {
      throw new Error("signal-text must have a name attribute");
    }
    this.signal = this._signalRegistry.get(name) ?? null;
    this.ready = true;

    if (this.signal == null) {
      return;
    }
    this.cleanUp = this.signal.subscribe((newValue) => {
      return this.updateChildren(newValue);
    }) ?? null;
    this.updateChildren(this.signal.get());
  }

  disconnectedCallback() {
    this.cleanUp?.();
    this.mounted = false;
    // (this as any)._signalRegistry = null;
  }

  updateChildren = (newValue: any): void => {
    if (!this.ready) {
      return;
    }
    if (this._watch) {
      newValue = newValue[this._watch];
    }
    
    // Handle NaN separately since it can't be used in a switch statement
    if (Number.isNaN(newValue)) {
      this.innerHTML = "";
      return;
    }

    switch (newValue) {
      case undefined:
      case null:
        this.innerHTML = "";
        break;
      default:
        this.innerHTML = `${newValue}`;
    }
  };
}
