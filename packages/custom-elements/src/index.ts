import type { AnyFunction } from "./utils/types";

import "./core";
import "./let-signal";
import "./signal-html";

declare global {
	interface Window {
		__FNS__: Record<string, AnyFunction>;
	}
}

window.__FNS__ ??= {};
