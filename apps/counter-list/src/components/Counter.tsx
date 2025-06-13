import { createElement, createSignal } from "@solenoid/server-runtime";

export function Counter() {
	const count = createSignal(0);
	const doubleCount = () => count() * 2;
	return (
		<div>
			<button type="button" onClick={() => count(count() + 1)}>
				Increment
			</button>
			<p>Count: {count()}</p>
			<p>Double Count: {doubleCount()}</p>
		</div>
	);
}
