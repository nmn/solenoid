import { computed, effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";

export default class ForEach extends HTMLElement {
	/*
  JSX:
  const counterValues = createSignal([1,2,3]);

  <for-each
    values={counterValues}
    map={(counterValue, index)=>(
      <div style={{display: 'inline-block'}}>
        {counterValue()}
      </div>
    )}
  />

  HTML:
  <for-each values="/signal serialized/" map="/arrow func serialized/">
    <list-item index="0">
      <div style="display: block;">
        <signal-text value='{"__type":"$$COMPUTED_SIGNAL","index":"0"}'>
      </div>
    </list-item>
    <list-item index="1">
      <div style="display: block;">
        <signal-text value='{"__type":"$$COMPUTED_SIGNAL","index":"1"}'>
      </div>
    </list-item>
    <list-item index="2">
      <div style="display: block;">
        <signal-text value='{"__type":"$$COMPUTED_SIGNAL","index":"2"}'>
      </div>
    </list-item>
  </for-each>
  */
	static observedAttributes = ["values", "map"];

	private values: () => unknown[];
  private map: (val: unknown, index: number)=>HTMLElement | string;
	isConnected = true;
	private cleanUp: null | (() => void) = null;
	private abortController: AbortController = new AbortController();

	async connectedCallback() {
		if (!this.isConnected) return;
		const values = this.getAttribute("values");
		if (!values) {
			throw new Error("for-each must have a \"values\" attribute");
		}
    const map = this.getAttribute("map");
    if (!map) {
			throw new Error("for-each must have a \"map\" attribute");
		}
    
		this.isConnected = true;
		const [parsedValues, parsedMap] = await Promise.all([JSON_PARSE(values), JSON_PARSE(map)])

		if (parsedValues && typeof parsedValues === "function" && parsedMap && typeof parsedMap === 'function') {
			this.values = parsedValues;
      this.map = parsedMap;

			requestAnimationFrame(() => this.render());
		} else {
			this.isConnected = false;
		}
	}

	render() {
    const stopScope = effectScope(()=>{
      effect(()=>{
        this.innerHTML = '';
        const nodes = this.values().map((_, index)=>{
          return this.map(computed(()=>this.values()[index]), index);
        });

        this.append(...nodes);
      });
    });

		this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.isConnected = false;
	}
}

customElements.define("for-each", ForEach);
