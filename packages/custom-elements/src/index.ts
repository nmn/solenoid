import "./core";
import "./let-signal";
import "./signal-html";

declare global {
	interface Window {
		__FNS__: Record<string, Function>;
	}
}

window.__FNS__ ??= {};
