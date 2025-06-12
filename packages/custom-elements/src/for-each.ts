import { effect, effectScope, signal } from "alien-signals";
import { JSON_PARSE } from "./core";

// This is to disregard counting any templates at the start of the for-each
const NON_LIST_ELEMENT_LENGTH = 1;

export class ForEach extends HTMLElement {
	/*
  JSX:
  const counterValues = createSignal([1,2,3]);

  <for-each
    values={counterValues}
  >
		<template><div style="display: block;">...</div></template> <!-- this is a template that exists to create more list-items -->
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
	private fragment: DocumentFragment = document.createDocumentFragment();

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
				const values = this.values?.() ?? [];

				// if the array has shrank, drop list items -- their disconnectedCallbacks are to be handled by the DOM
				if (this.getElementsLength() > values.length) {
					const removeCount = this.getElementsLength() - values.length;
					const newChildren = Array.from(this.children);

					for (let i = 0; i < removeCount; i++) {
						newChildren.pop();
					}

					this.replaceChildren(...newChildren);
				}

				// notify all list items of their new index
				this.forEachListItem((child: ListItem, index: number) => {
					child.__setIndex(index);
				});

				const newElements = document.createDocumentFragment();
				const len = this.getElementsLength();

				for (let i = 0; len + i < values.length; i++) {
					const newItem = this.createNewListItem(len + i);
					newElements.appendChild(newItem);
				}

				this.appendChild(newElements);
			});
		});
	}

	private forEachListItem(cb: (child: ListItem, index: number) => void): void {
		for (let i = NON_LIST_ELEMENT_LENGTH; i < this.children.length; i++) {
			const listItem = this.children[i] as ListItem;
			cb(listItem, i - NON_LIST_ELEMENT_LENGTH);
		}
	}

	private getElementsLength(): number {
		// We render a template node first, then all elements, so we need to disregard the first child in the elements length.
		return this.children.length - NON_LIST_ELEMENT_LENGTH;
	}

	disconnectedCallback() {
		this.cleanUp?.();
		this.isConnected = false;
	}

	createNewListItem(index: number): ListItem {
		if (this.dummyItem == null) {
			const template = this.children[0] as HTMLTemplateElement;
			const dummyItem = template.content.children[0].cloneNode(
				true,
			) as ListItem;
			this.fragment.append(dummyItem);
			customElements.upgrade(dummyItem);
			this.dummyItem = dummyItem;
		}

		const node = this.dummyItem.cloneNode(true) as ListItem;
		node.__setIndex(index);
		return node;
	}
}

customElements.define("for-each", ForEach);

const STATIC_NON_CHILD_LENGTH = 1;

// List item signals don't belong in the signal store -- they are to be managed by the for-each.
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

		if (this.children.length > STATIC_NON_CHILD_LENGTH) {
			return;
		}

		const template = this.children[0] as HTMLTemplateElement;

		const fragmentClone = template.content.cloneNode(true);
		customElements.upgrade(fragmentClone);

		this.append(fragmentClone);

		this.hasRemovedTemplate = true;
	}

	__setIndex(num: number) {
		if (this.__index == null) {
			this.__index = signal(num);
		} else {
			this.__index(num);
		}

		// All internal values should be able to be recreated with HTML alone
		this.setAttribute("initial-index", num.toString());
	}

	get index(): NonNullable<Index> {
		this.__initializeIndexSignal();

		return this.__index;
	}
}

customElements.define("list-item", ListItem);
