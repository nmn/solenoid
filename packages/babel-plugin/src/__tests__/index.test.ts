import { describe, it, expect } from "vitest";
import { getFixtures, transform } from "./helpers";

describe("Babel Plugin", async () => {
	describe("fixture", async () => {
		const fixtures = await getFixtures();

		it.concurrent.for(fixtures)(
			'"%s" compiles and works',
			async ([
				,
				{ expectedResult, generatedFileName, sourceContents },
			]) => {
				const [transformedCode, runCode] = transform(sourceContents);

				console.log('code\n', transformedCode);

				await expect(transformedCode).toMatchFileSnapshot(generatedFileName);

				expect(runCode()).toBe(expectedResult);
			},
		);
	});
});
