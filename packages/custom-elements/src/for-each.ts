import { effect, effectScope, signal } from "alien-signals";
import { JSON_PARSE } from "./core";

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
	private cleanUp?: () => void;
	private values?: () => [];

	async connectedCallback() {
		if (!this.isConnected) return;
		const values = this.getAttribute("values");
		if (!values) {
			throw new Error('for-each must have a "values" attribute');
		}

		this.values = await JSON_PARSE(values, this);

		requestAnimationFrame(() => this.render());
	}

	render() {
		this.cleanUp?.();
		this.cleanUp = effectScope(() => {
			effect(() => {
				// TODO: Properly watch values, update indices
				const values = this.values?.() ?? [];
				while (this.children.length > values.length) {
					this.removeChild(this.lastChild!);
				}

				Array.prototype.forEach.call(
					this.children,
					(child: ListItem, index: number) => {
						child.__setIndex(index);
					},
				);

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

type Index = ReturnType<typeof signal<number>> | null | undefined;

export class ListItem extends HTMLElement {
	static observedAttributes = ["initial-index"];

	private cleanUp: null | (() => void) = null;
	private hasRemovedTemplate: boolean = false;
	protected __index: Index;
	isConnected = true;

	async connectedCallback() {
		if (!this.isConnected) return;

		this.__reinitializeIndexSignal();
		requestAnimationFrame(() => this.render());
	}

	disconnectedCallback() {
		this.cleanUp?.();
		this.isConnected = false;
	}

	render() {
		this.__removeTemplate();
	}

	__reinitializeIndexSignal(): asserts this is this & {
		__index: NonNullable<Index>;
	} {
		const initialIndex = this.getAttribute("initial-index");
		const initialIndexNum = Number(initialIndex);
		if (isNaN(initialIndexNum)) {
			throw new Error(
				`list-item received an invalid "initial-index": ${initialIndex}`,
			);
		}
		// This doesn't need to go to the signal store since it's associated with the element's position.
		this.__index = signal(initialIndexNum);
	}

	__initializeIndexSignal(): asserts this is this & {
		__index: NonNullable<Index>;
	} {
		if (this.__index == null) {
			this.__reinitializeIndexSignal();
		}
	}

	__removeTemplate() {
		if (this.hasRemovedTemplate) {
			return;
		}

		const template = this.children[0] as HTMLTemplateElement;

		if (
			process.env.NODE_ENV === "development" &&
			(this.children.length !== 1 || !(template instanceof HTMLTemplateElement))
		) {
			console.error(
				`list-item received incorrect children. It must be a single <template>.`,
			);
		}

		this.innerHTML = template.innerHTML;

		this.hasRemovedTemplate = true;
	}

	__setIndex(num: number) {
		this.__initializeIndexSignal();
		this.__index(num);
	}

	get index(): NonNullable<Index> {
		this.__initializeIndexSignal();

		return this.__index;
	}
}

customElements.define("list-item", ListItem);
