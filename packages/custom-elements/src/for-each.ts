import { computed, effect, effectScope } from "alien-signals";
import { JSON_PARSE } from "./core";

export class ForEach extends HTMLElement {
	/*
  JSX:
  const counterValues = createSignal([1,2,3]);

  <for-each
    values={counterValues}
  >
    <list-item>
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item>
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item>
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
  </for-each>

  HTML:
  // only main difference right now is adding the indices from for-each to list-items
  <for-each values="/signal serialized/">
    <list-item index="0">
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item index="1">
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item index="2">
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
  </for-each>
  */
	static observedAttributes = ["values"];

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
    console.log('success');
    // const map = this.getAttribute("map");
    // if (!map) {
		// 	throw new Error("for-each must have a \"map\" attribute");
		// }
    
		// this.isConnected = true;
		// const [parsedValues, parsedMap] = await Promise.all([JSON_PARSE(values), JSON_PARSE(map)])

		// if (parsedValues && typeof parsedValues === "function" && parsedMap && typeof parsedMap === 'function') {
		// 	this.values = parsedValues;
    //   this.map = parsedMap;

		// 	requestAnimationFrame(() => this.render());
		// } else {
		// 	this.isConnected = false;
		// }
	}

	render() {
    // const stopScope = effectScope(()=>{
    //   effect(()=>{
    //     this.innerHTML = '';
    //     const nodes = this.values().map((_, index)=>{
    //       return this.map(computed(()=>this.values()[index]), index);
    //     });

    //     this.append(...nodes);
    //   });
    // });

		// this.cleanUp = stopScope;
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.isConnected = false;
	}
}

customElements.define("for-each", ForEach);


export class ListItem extends HTMLElement {

}

customElements.define('list-item', ListItem);
