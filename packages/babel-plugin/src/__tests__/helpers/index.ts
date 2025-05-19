import type { BabelFileResult } from "@babel/core";

import * as fs from "fs";
import * as path from "path";
import * as babel from "@babel/core";
import plugin, { type PluginOptions } from "../..";
const babelPresetEnv = require.resolve('@babel/preset-env');
const babelPresetTypescript = require.resolve("@babel/preset-typescript");

type FixtureName = string;
type Helpers = {
	expectedResult: unknown;
	generatedFileName: string;
  sourceContents: string;
};

type Result = [FixtureName, Helpers];

export async function getFixtures(): Promise<Result[]> {
	const fixturesFolder = path.join(__dirname, "../fixtures");

	return Promise.all(
		fs
			.readdirSync(fixturesFolder, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map(async (entry) => {
				const fixtureDirectoryPath = path.join(entry.parentPath, entry.name);

				const sourceFileName = path.join(fixtureDirectoryPath, "./index.ts");
				const expectedResultFileName = path.join(
					fixtureDirectoryPath,
					"./result.ts",
				);
        const sourceContents = fs.readFileSync(sourceFileName).toString();

				const generatedFileName = path.join(fixtureDirectoryPath, "./index_generated.js");


				const expectedResult = (
					(await import(expectedResultFileName)) as { result: unknown }
				).result;

				const nameForTestToSee = entry.name;

				return [
					nameForTestToSee,
					{
						expectedResult,
						sourceContents,
						generatedFileName,
					},
				] as Result;
			}),
	);
}

export function transform<T>(
	code: string,
	options: PluginOptions = {},
): [NonNullable<BabelFileResult["code"]>, () => T] {
	const res = babel.transformSync(code as string, {
		plugins: [[plugin, options]],
		presets: [babelPresetTypescript, babelPresetEnv],
		filename: "foo.ts",
		configFile: false,
		babelrc: false,
	});

	const output = (res as NonNullable<typeof res>).code as string;

	return [output, (() => eval(output)) as () => T];
}
