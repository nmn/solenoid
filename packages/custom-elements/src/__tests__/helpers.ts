import { waitFor } from "@testing-library/dom";
import { expect } from "vitest";

export function waitForElement(element: HTMLElement) {
	return waitFor(() => expect(element.isConnected).toBe(true));
}
