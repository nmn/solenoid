import { createElement, createSignal } from "@solenoid/server-runtime";

export function Static() {
	const count = createSignal(0);
	return (
		<div>
			Hello
			<span>World</span>
		</div>
	);
}
