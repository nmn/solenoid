export const AfterAddObserver = (() => {
	let observer: MutationObserver | null = null;
	let teardownTimer: NodeJS.Timeout | null = null;
	const waiting = new Map<HTMLElement, (node: Node) => void>(); // element → resolve()
	let lastNode: Node | null = null;

	// MutationObserver callback
	function onMutations(mutations: MutationRecord[]) {
		for (const { addedNodes } of mutations) {
			for (const node of addedNodes) {
				// Resolve any waiting element when ANY node appears outside it
				for (const [el, resolve] of waiting) {
					// Use compareDocumentPosition to check if node comes after el or any ancestor of el (not a descendant or prior sibling)
					if (
						el.compareDocumentPosition(node) ===
						Node.DOCUMENT_POSITION_FOLLOWING
					) {
						resolve(node);
						waiting.delete(el);
					}
				}
				if (lastNode == null) {
					lastNode = node;
				}
				if (
					lastNode.compareDocumentPosition(node) ===
					Node.DOCUMENT_POSITION_FOLLOWING
				) {
					lastNode = node;
				}
			}
		}

		// If everyone’s resolved, schedule a delayed teardown
		if (waiting.size === 0 && observer) {
			teardownTimer = setTimeout(() => {
				observer?.disconnect();
				observer = null;
				teardownTimer = null;
			}, 500);
		}
	}

	// Ensure observer is running, and cancel any pending teardown
	function ensureObserver() {
		if (teardownTimer) {
			clearTimeout(teardownTimer);
			teardownTimer = null;
		}
		if (!observer) {
			observer = new MutationObserver(onMutations);
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	}

	return {
		/**
		 * Call inside your custom element’s connectedCallback.
		 * Returns a Promise that resolves with the first node
		 * added under <body> that isn’t a descendant of `el`.
		 */
		register(el: HTMLElement) {
			if (
				lastNode != null &&
				el.compareDocumentPosition(lastNode) ===
					Node.DOCUMENT_POSITION_FOLLOWING
			) {
				return Promise.resolve(lastNode);
			}
			ensureObserver();
			return new Promise((resolve) => {
				waiting.set(el, resolve);
			});
		},
	};
})();

// // Example custom element
// class StreamWatcher extends HTMLElement {
// 	connectedCallback() {
// 		this.nextOutside = AfterAddObserver.register(this);
// 		this.nextOutside.then((node) => {
// 			console.log("Something was added after me:", node);
// 		});
// 	}
// }

// customElements.define("stream-watcher", StreamWatcher);
