import { effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";

export class ForEach extends HTMLElement {
  static observedAttributes = ["list"];

  private list: () => Array<HTMLElement | string>;
  private cleanUp: null | (() => void) = null;
  private templateHTML: string | null = null;

  isConnected = true;

  async connectedCallback() {
    if (!this.isConnected) {
      return;
    }

    const list = this.getAttribute("list");
    if (!list) {
      throw new Error(
        'for-each must have a "list" attribute'
      );
    }

    this.isConnected = true;
    const parsedValue = await JSON_PARSE(list);

    if (!this.isConnected) {
      return;
    }

    if (parsedValue && typeof parsedValue === "function") {
      this.list = parsedValue;

      requestAnimationFrame(() => this.render());
    } else {
      this.isConnected = false;
    }
  }

  render(value?: unknown) {
    this.cleanUp && this.cleanUp();
    this.templateHTML ??= this.innerHTML;
    const stopScope = effectScope(() => {
      effect(() => {
        const arr = this.list();
        // temp solution, wipe the existing inside (do not use long term)
        this.innerHTML = '';
        this.append(...arr);
      });
    });
    this.cleanUp = stopScope;
  }

  disconnectedCallback() {
    this.cleanUp?.();
    this.isConnected = false;
  }
}

customElements.define("for-each", ForEach);
