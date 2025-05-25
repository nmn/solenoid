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

  hasRemovedTemplate: boolean = false;
	isConnected = true;
	private cleanUp: null | (() => void) = null;

	async connectedCallback() {
		if (!this.isConnected) return;
		const values = this.getAttribute("values");
		if (!values) {
			throw new Error("for-each must have a \"values\" attribute");
		}
    
    requestAnimationFrame(()=>this.render());
	}

  initializeIndices() {
    if (this.hasRemovedTemplate) {
      return;
    }

    const childElement = this.children[0] as HTMLTemplateElement;
    childElement.childNodes.forEach((node: ListItem, index)=>{
      if (process.env.NODE_ENV === 'development' && !(node instanceof ListItem)) {
        console.error('Every child of for-each must be a list-item');
      }

      node.__setIndex(index);
    });

    this.innerHTML = childElement.innerHTML;
    this.hasRemovedTemplate = true;
  }

	render() {
    this.initializeIndices();
	}

	disconnectedCallback() {
		this.cleanUp && this.cleanUp();
		this.isConnected = false;
	}
}

customElements.define("for-each", ForEach);


export class ListItem extends HTMLElement {
  static observedAttributes = ["index"];

  private cleanUp: null | (() => void) = null;
  index: number;
  isConnected = true;

  async connectedCallback() {
		if (!this.isConnected) return;
		const index = this.getAttribute("index");
    const indexNum = Number(index);
		if (!index || isNaN(indexNum)) {
			throw new Error("list-item must have a \"index\" attribute");
		}
    this.index = indexNum;
  }

  disconnectedCallback() {
    this.cleanUp && this.cleanUp();
		this.isConnected = false;
  }

  render() {
  }

  __setIndex(num: number) {
    if (isNaN(num)) {
      throw new Error(`invalid index set: ${num}`);
    }

    this.index = num;
  }
}

customElements.define('list-item', ListItem);
