import { computed, effect, effectScope } from "alien-signals";
import { JSON_PARSE, createSignal, type Signal, signalStore } from "./core";

export class ForEach extends HTMLElement {
	/*
  JSX:
  const counterValues = createSignal([1,2,3]);

  <for-each
    values={counterValues}
  >
    <list-item initial-index="0">
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item initial-index="1">
      <div style="display: block;">
        <signal-text value='{"__type":"$$CONTEXT"}'>
      </div>
    </list-item>
    <list-item initial-index="2">
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

	isConnected = true;
	private cleanUp?: (() => void);
  private hasRemovedTemplate: boolean = false;
  private values?: ()=>[];

	async connectedCallback() {
		if (!this.isConnected) return;
		const values = this.getAttribute("values");
		if (!values) {
			throw new Error("for-each must have a \"values\" attribute");
		}

    this.values = await JSON_PARSE(values);
    
    requestAnimationFrame(()=>this.render());
	}

	render() {
    this.cleanUp?.();
    this.cleanUp = effectScope(()=>{
      effect(()=>{
        // TODO: Properly watch values, update indices
        const values = this.values?.() ?? [];
        while (this.children.length > values.length) {
          this.removeChild(this.lastChild);
        }

        Array.prototype.forEach.call(this.children, (child: ListItem, index: number)=>{
          child.__setIndex(index);
        });

        // while (this.children.length < values.length) {
        // Need to do some cloning...
        // }
      });
    });
	}

	disconnectedCallback() {
		this.cleanUp?.();
		this.isConnected = false;
	}
}

customElements.define("for-each", ForEach);

type Index = Signal<number> | null | undefined;

export class ListItem extends HTMLElement {
  static observedAttributes = ["initial-index", "name"];

  private cleanUp: null | (() => void) = null;
  private hasRemovedTemplate: boolean = false;
  protected index: Index;
  isConnected = true;

  async connectedCallback() {
		if (!this.isConnected) return;    

    this.__initializeIndexSignal();
    requestAnimationFrame(()=>this.render());
  }

  disconnectedCallback() {
    this.cleanUp?.();
		this.isConnected = false;
  }

  render() {
    this.__removeTemplate();
  }

  __initializeIndexSignal(): asserts this is this & {index: NonNullable<ListItem['index']>} {
    const name = this.getAttribute('name');
    if (!name) {
      throw new Error('list-item did not receive a "name"');
    }
    const initialIndex = this.getAttribute('initial-index');
    const initialIndexNum = Number(initialIndex);
    if (isNaN(initialIndexNum)) {
      throw new Error(`list-item received an invalid "initial-index": ${initialIndex}`);
    }
    this.index = createSignal(name, initialIndexNum);
    signalStore.set(name, this.index);
  }

  __removeTemplate() {
    if (this.hasRemovedTemplate) {
      return;
    }

    const template = this.children[0] as HTMLTemplateElement;

    if (process.env.NODE_ENV === 'development' && (this.children.length !== 1 || !(template instanceof HTMLTemplateElement))) {
      console.error(`list-item received incorrect children. It must be a single <template>.`);
    }

    this.innerHTML = template.innerHTML;

    this.hasRemovedTemplate = true;
  }

  __setIndex(num: number) {
    if (this.index == null) {
      this.__initializeIndexSignal();
    }
    this.index!(num);
  }
}

customElements.define('list-item', ListItem);
