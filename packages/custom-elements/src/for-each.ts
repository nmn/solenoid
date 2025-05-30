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
	protected dummyItem?: Readonly<ListItem>;

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
		this.createDummyItem();
		this.cleanUp?.();
		this.cleanUp = effectScope(() => {
			effect(() => {
				const values = this.values?.() ?? [];
				console.log("got new values", values);

				while (this.children.length > values.length) {
					this.removeChild(this.lastChild!);
				}

				Array.prototype.forEach.call(
					this.children,
					(child: ListItem, index: number) => {
						child.__setIndex(index);
					},
				);

				while (this.children.length < values.length) {
					console.log("appending new list item");
					const newItem = this.createNewListItem();
					// We don't setAttribute('initial-index', num.toString())
					// because we don't want the extra compute to re-process back to number
					newItem.__setIndex(this.children.length);
					this.appendChild(newItem);
				}
			});
		});
	}

	disconnectedCallback() {
		this.cleanUp?.();
		this.isConnected = false;
	}

	createDummyItem(): Readonly<ListItem> {
		if (this.dummyItem == null) {
			console.log("creating a dummy item");
			const template = this.children[0] as HTMLTemplateElement;
			if (
				process.env.NODE_ENV === "development" &&
				!(template instanceof HTMLTemplateElement)
			) {
				console.error("The first child of ", this, "was not <template>");
			}

			this.removeChild(template);

			this.dummyItem = document.createElement("list-item") as ListItem;
			this.dummyItem.append(template);
		}
		return this.dummyItem;
	}

	createNewListItem(): ListItem {
		return this.createDummyItem().cloneNode(true) as ListItem;
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

		this.__initializeIndexSignal();
		requestAnimationFrame(() => this.render());
	}

	disconnectedCallback() {
		this.cleanUp?.();
		this.isConnected = false;
	}

	render() {
		this.__removeTemplate();
	}
	__initializeIndexSignal(): asserts this is this & {
		__index: NonNullable<Index>;
	} {
		if (this.__index == null) {
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
		if (this.__index == null) {
			this.__index = signal(num);
			return;
		}

		this.__index(num);
	}

	get index(): NonNullable<Index> {
		this.__initializeIndexSignal();

		return this.__index;
	}
}

customElements.define("list-item", ListItem);
