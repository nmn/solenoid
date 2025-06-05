import { waitFor } from "@testing-library/dom";
import { expect } from "vitest";

export function waitForElement(element: HTMLElement) {
	return waitFor(() => expect(element.isConnected).toBe(true));
}

export function randomString() {
	return Math.random().toString(36).slice(2);
}

export function waitForElementToBeRemoved(element: HTMLElement) {
	return waitFor(() => expect(element.parentNode).toBeNull());
}
