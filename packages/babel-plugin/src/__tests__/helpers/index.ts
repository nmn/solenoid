import type {BabelFileResult} from '@babel/core';

import * as fs from "fs";
import * as path from "path";
import * as babel from '@babel/core';
import plugin from '../..';

const rootDir = path.dirname(require.resolve("../../../package.json"));

declare global {
  // eslint-disable-next-line
  var $identifier: <T>(p: T)=>T;
}

type FixtureName = string;
type Helpers = {
  fileContents: string;
  generatedFileName: string;
  niceFileName: string;
};

type Result = [FixtureName, Helpers];

export function getFixtures(): Result[] {
  const fixturesFolder = path.join(__dirname, "../fixtures");

  return fs
    .readdirSync(fixturesFolder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const fixtureDirectoryPath = path.join(entry.parentPath, entry.name);

      const fileName = path.join(fixtureDirectoryPath, "./index.soy");
      const niceFileName = path.relative(rootDir, fileName);

      const generatedFileName = path.join(fixtureDirectoryPath, "./index.js");

      const fileContents = fs.readFileSync(fileName).toString();

      return [
        entry.name,
        {
          fileContents,
          generatedFileName,
          niceFileName,
        },
      ] as Result;
    });
}


export function transform<T>(code: string): [
  NonNullable<BabelFileResult['code']>,
  ()=>T
] {
  const res = babel.transformSync(code as string, {
    plugins: [plugin],
    configFile: false,
    babelrc: false,
  });

  const output = (res as NonNullable<typeof res>).code as string;

  return [output, ()=>eval(/* js */`
  
    ${output}
  `)];
}
