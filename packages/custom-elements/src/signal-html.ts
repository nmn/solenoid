import { effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";
import "./for-each";

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
	isConnected = true;

	async connectedCallback() {
		if (!this.isConnected) return;
		const value = this.getAttribute("value");
		if (!value) {
			throw new Error("signal-text must have a value attribute");
		}
		this.isConnected = true;
		const that = this;
		const parsedValue = await JSON_PARSE(value, that);
		if (!this.isConnected) {
			return;
		}

		if (parsedValue && typeof parsedValue === "function") {
			this.value = parsedValue;

			requestAnimationFrame(() => this.render());
		} else {
			this.isConnected = false;
		}
	}

	render() {
		this.cleanUp?.();
		const stopScope = effectScope(() => {
			effect(() => {
				const latestText = this.value!();
				this.innerText = String(latestText);
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.isConnected = false;
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
	private value?: () => { [key: string]: unknown };
	isConnected = true;

	async connectedCallback() {
		if (!this.isConnected) return;
		const value = this.getAttribute("value");
		if (!value) {
			throw new Error("signal-text must have a value attribute");
		}
		this.isConnected = true;
		const that = this;
		const parsedValue = await JSON_PARSE(value, that);

		if (parsedValue && typeof parsedValue === "function") {
			this.value = parsedValue;

			requestAnimationFrame(() => this.render());
		} else {
			this.isConnected = false;
		}
	}

	render() {
		// There should only ever be a single child element
		const childElement = this.children[0] as HTMLElement;
		const stopScope = effectScope(() => {
			effect(() => {
				const latestAttrs = this.value!();
				// unbind previous event listeners and re-attach them
				this.abortController.abort();
				this.abortController = new AbortController();
				for (const key of Object.keys(latestAttrs)) {
					if (key.match(/^on[A-Z]/)) {
						// Wasteful right now, but ok
						// Event listener exists, add it
						childElement.addEventListener(
							key.slice(2).toLowerCase(),
							latestAttrs[key] as EventListener,
							{ signal: this.abortController.signal },
						);
					} else if (key in childElement) {
						// Property exists, set it directly
						(childElement as any)[key] = latestAttrs[key];
					} else {
						// Property doesn't exist, fall back to setAttribute
						childElement.setAttribute(key, String(latestAttrs[key]));
					}
				}
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.abortController.abort();
		this.isConnected = false;
	}
}

customElements.define("signal-attrs", SignalAttrs);

export class ShowWhen extends HTMLElement {
	static observedAttributes = ["condition"];

	private condition?: () => unknown;
	private cleanUp: null | (() => void) = null;
	private templateHTML: string | null = null;
	isConnected = true;

	async connectedCallback() {
		if (!this.isConnected) return;
		const condition = this.getAttribute("condition");
		if (!condition) {
			throw new Error("signal-text must have a condition attribute");
		}
		this.isConnected = true;
		const that = this;
		const parsedValue = await JSON_PARSE(condition, that);
		if (!this.isConnected) {
			return;
		}

		if (parsedValue && typeof parsedValue === "function") {
			this.condition = parsedValue;

			requestAnimationFrame(() => this.render());
		} else {
			this.isConnected = false;
		}
	}

	render() {
		this.cleanUp && this.cleanUp();
		this.templateHTML ??= this.innerHTML;
		const stopScope = effectScope(() => {
			effect(() => {
				if (this.condition!()) {
					this.innerHTML = this.templateHTML!;
				} else {
					this.templateHTML = this.innerHTML.trim() ?? this.templateHTML;
					this.innerHTML = "";
				}
			});
		});
		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.isConnected = false;
	}
}
customElements.define("show-when", ShowWhen);
