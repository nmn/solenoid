import { effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";
import { signalStore } from "./signal-store-instance";

export class SignalText extends HTMLElement {
  static observedAttributes = ["value"];

  private value: () => unknown;
  isConnected = true;
  private cleanUp: void | (() => void);

  async connectedCallback() {
    if (!this.isConnected) return;
    const value = this.getAttribute("value");
    if (!value) {
      throw new Error("signal-text must have a value attribute");
    }
    this.isConnected = true;
    const parsedValue = await JSON_PARSE(value);

    if (parsedValue && typeof parsedValue === "function") {
      this.value = parsedValue;
      this.render();
    } else {
      this.isConnected = false;
    }
  }

  private render(value?: unknown) {
    const stopScope = effectScope(() => {
      effect(() => {
        const latestText = this.value();
        this.innerText = String(latestText);
      });
    });
    this.cleanUp = stopScope;
  }

  disconnectedCallback() {
    this.cleanUp?.();
    this.isConnected = false;
  }
}

export class SignalAttrs extends HTMLElement {
  static observedAttributes = ["value"];

  private value: () => ({[key: string]: unknown});
  isConnected = true;
  private cleanUp: void | (() => void);
  private abortController: AbortController = new AbortController();

  async connectedCallback() {
    if (!this.isConnected) return;
    const value = this.getAttribute("value");
    if (!value) {
      throw new Error("signal-text must have a value attribute");
    }
    this.isConnected = true;
    const parsedValue = await JSON_PARSE(value);

    if (parsedValue && typeof parsedValue === "function") {
      this.value = parsedValue;
      this.render();
    } else {
      this.isConnected = false;
    }
  }

  private render(value?: unknown) {
    // There should only ever be a single child element
    const childElement = this.children[0] as HTMLElement;
    const stopScope = effectScope(() => {
      effect(() => {
        const latestAttrs = this.value();
        // unbind previous event listeners and re-attach them
        this.abortController.abort();
        this.abortController = new AbortController();
        Object.keys(latestAttrs).forEach((key) => {
          if (key.match(/^on[A-Z]/)) {
            // Event listener exists, add it
            childElement.addEventListener(
              key.slice(2).toLowerCase(),
              latestAttrs[key] as EventListener,
              { signal: this.abortController.signal }
            );
          } else if (key in childElement) {
            // Property exists, set it directly
            childElement[key] = latestAttrs[key];
          } else {
            // Property doesn't exist, fall back to setAttribute
            childElement.setAttribute(key, String(latestAttrs[key]));
          }
        });

      });
    });
    this.cleanUp = stopScope;
  }

  disconnectedCallback() {
    this.cleanUp?.();
    this.isConnected = false;
  }
}
