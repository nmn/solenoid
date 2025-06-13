import { createElement, createSignal } from "@solenoid/server-runtime";

export function Counter() {
	const count = createSignal(0);
	return (
		<div>
			Hello
			<span>World</span>
		</div>
	);
}
