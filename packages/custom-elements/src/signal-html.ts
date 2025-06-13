import { effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";
import { AfterAddObserver } from "./utils/await-end";

export class SignalText extends HTMLElement {
	/*
  JSX:
  <div>
    {count()}
  </div>

  HTML:
  <let-signal name="$FN_countd8734" initialValue="0"></let-signal>
  <script>
    window.signals.count = createSignal("count", 0);
  </script>
  <div>
    <script>
      window.__FNS__ = {};
      window.__SOLENOID__.$FN_countd8734 = ($c1) => ($a1: number) => $c1() * $a1;
    </script>
    <signal-text value=`{__type: "FUNCTION", id: "$FN_countd8734", closureArgs: [{
      name: "count",
      __type: "$$SIGNAL"
    }]}`>0</signal-text>
    <await-suspense>
      <template data-fallback>
        Loading...
      </template>
      <template data-children>
        <async-data source="skhgfjkhgs">
          <signal-text value="skhgfjkhgs-dereived"></signal-text>
        </async-data>
      </template>
    </await-suspense>
  </div>
  */
	static observedAttributes = ["value"];

	private cleanUp: null | (() => void) = null;
	private value?: () => unknown;
	_isConnected = false;

	async connectedCallback() {
		if (this._isConnected) return;

		const value = this.getAttribute("value");
		if (!value) {
			throw new Error("signal-text must have a value attribute");
		}
		const parsedValue = await JSON_PARSE(value);

		if (parsedValue && typeof parsedValue === "function") {
			this.value = parsedValue;
			await AfterAddObserver.register(this);
			this._isConnected = true;
			this.render();
		} else {
			this._isConnected = false;
		}
	}

	render() {
		this.cleanUp?.();
		const value = this.value;
		if (!value) {
			return;
		}
		const stopScope = effectScope(() => {
			effect(() => {
				const latestText = value();
				this.innerText = String(latestText);
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this._isConnected = false;
	}
}
customElements.define("signal-text", SignalText);

export class SignalAttrs extends HTMLElement {
	/*
  JSX:
  <div className={count() % 2 === 0 ? "even" : "odd"}>
    some text
  </div>

  HTML:
  <signal-attrs value='{"className": count() % 2 === 0 ? "even" : "odd"}'>
    <div className="even">
      some text
    </div>
  </signal-attrs>
  */
	static observedAttributes = ["value"];

	private abortController: AbortController = new AbortController();
	private cleanUp: null | (() => void) = null;
	value?: { [key: string]: () => unknown };
	_isConnected = false;

	async connectedCallback() {
		if (this._isConnected) return;
		const value = this.getAttribute("value");
		if (!value) {
			throw new Error("signal-text must have a value attribute");
		}
		const parsedValue = await JSON_PARSE(value);

		if (parsedValue && typeof parsedValue === "object") {
			this.value = parsedValue;
			await AfterAddObserver.register(this);
			this._isConnected = true;
			this.render();
		} else {
			this._isConnected = false;
		}
	}

	render() {
		// There should only ever be a single child element
		const childElement = this.children[0] as HTMLElement;
		const value = this.value;
		if (!value) {
			return;
		}
		const stopScope = effectScope(() => {
			effect(() => {
				const latestAttrs = value;
				// unbind previous event listeners and re-attach them
				this.abortController.abort();
				this.abortController = new AbortController();
				for (const key of Object.keys(latestAttrs)) {
					const value = latestAttrs[key];
					if (value == null) {
						continue;
					}
					if (key.match(/^on[A-Z]/)) {
						// Wasteful right now, but ok
						// Event listener exists, add it
						childElement.addEventListener(
							key.slice(2).toLowerCase(),
							value as EventListener,
							{ signal: this.abortController.signal },
						);
					} else if (key in childElement) {
						// Property exists, set it directly
						(childElement as any)[key] = value();
					} else {
						// Property doesn't exist, fall back to setAttribute
						childElement.setAttribute(key, String(value()));
					}
				}
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.abortController.abort();
		this._isConnected = false;
	}
}

customElements.define("signal-attrs", SignalAttrs);

export class ShowWhen extends HTMLElement {
	static observedAttributes = ["condition"];

	private condition?: () => unknown;
	private cleanUp: null | (() => void) = null;
	private templateHTML = "";
	_isConnected = false;

	async connectedCallback() {
		if (this._isConnected) return;
		const condition = this.getAttribute("condition");
		if (!condition) {
			throw new Error("signal-text must have a condition attribute");
		}
		const parsedValue = await JSON_PARSE(condition);

		if (parsedValue && typeof parsedValue === "function") {
			this.condition = parsedValue;
			await AfterAddObserver.register(this);
			this._isConnected = true;
			this.render();
		} else {
			this._isConnected = false;
		}
	}

	render() {
		this.cleanUp && this.cleanUp();
		this.templateHTML ||=
			this.children.length === 1 &&
			this.children[0] instanceof HTMLTemplateElement
				? this.children[0].innerHTML
				: this.innerHTML;
		const condition = this.condition;
		if (!condition) {
			return;
		}
		const stopScope = effectScope(() => {
			effect(() => {
				if (condition()) {
					this.innerHTML = this.templateHTML;
				} else {
					this.templateHTML = this.innerHTML.trim() || this.templateHTML;
					this.innerHTML = `<template>${this.templateHTML}</template>`;
				}
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this._isConnected = false;
	}
}
customElements.define("show-when", ShowWhen);
