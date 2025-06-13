import { LetSignal } from "@solenoid/custom-elements/lib/let-signal";
import {
	ShowWhen,
	SignalAttrs,
	SignalText,
} from "@solenoid/custom-elements/lib/signal-html";
import ts from "typescript";
import { describe, expect, test } from "vitest";

describe("jsx-runtime", () => {
	test("properly compiles jsx", () => {
		expect(
			transformJSX(/* jsx */ '<div data-foo="bar"/>'),
		).toMatchInlineSnapshot(`
      "import { jsx as _jsx } from "@solenoid/server-runtime/lib/jsx-runtime";
      _jsx("div", { "data-foo": "bar" });
      "
    `);

		expect(
			transformJSX(/* jsx */ "<signal-attrs><button/></signal-attrs>"),
		).toMatchInlineSnapshot(`
      "import { jsx as _jsx } from "@solenoid/server-runtime/lib/jsx-runtime";
      _jsx("signal-attrs", { children: _jsx("button", {}) });
      "
    `);
	});

	test("properly converts the function call to proper elements", () => {
		expect(<let-signal />).toBeInstanceOf(LetSignal);

		expect(<show-when />).toBeInstanceOf(ShowWhen);

		expect(<signal-attrs />).toBeInstanceOf(SignalAttrs);

		expect(<signal-text />).toBeInstanceOf(SignalText);

		expect(
			(
				<signal-attrs>
					<button />
				</signal-attrs>
			).children[0],
		).toBeInstanceOf(HTMLButtonElement);
	});
});

function transformJSX(code: string, fileName = "fake.tsx"): string {
	const result = ts.transpileModule(code, {
		compilerOptions: {
			jsx: ts.JsxEmit.ReactJSX, // Use ReactJSX or React depending on JSX runtime
			target: ts.ScriptTarget.Latest,
			module: ts.ModuleKind.Preserve,
			incremental: false,
			noEmit: true,
			jsxImportSource: "@solenoid/server-runtime/lib",
			importHelpers: false,
			preserveConstEnums: true,
			removeComments: false,
			sourceMap: false,
		},
		fileName,
		reportDiagnostics: true,
	});

	return result.outputText;
}
