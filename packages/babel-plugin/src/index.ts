import type {PluginObj, NodePath} from '@babel/core';
import type { BabelAPI } from '@babel/helper-plugin-utils';
import type {PluginOptions, PluginState} from './types';

import babelGenerator from '@babel/generator';
import * as babelTypes from '@babel/types';
import { declare } from "@babel/helper-plugin-utils";
import { PRAGMA, REPLACEMENT } from './identifiers.json';
import { getIsolatedArrowFunction } from './helpers/transformArrowFunction';
import validatePragmaUse from './helpers/validatePragmaUse';
import validateCallExpressionAndGetArrowFunction from './helpers/validateCallExpressionAndGetArrowFunction';

export default declare<
  PluginOptions, 
  // @ts-expect-error There's an issue with DefinitelyTyped here https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72756
  PluginObj<PluginState>
>((api: BabelAPI, options: PluginOptions, dirname: string): PluginObj<PluginState> => {
  api.assertVersion(7);

  return {
    visitor: {
      Program: {
        enter(programPath, state) {
          // TODO: Check if PRAGMA was imported from correct module
          this.hasImportedCorrectlyFromModule = true;
        }
      },

      CallExpression(path: NodePath<babelTypes.CallExpression>, state) {
        if (!this.hasImportedCorrectlyFromModule) {
          return;
        }

        const { callee } = path.node;

        if (!babelTypes.isIdentifier(callee, { name: PRAGMA })) {
          return; 
        }

        const arrowPath = validateCallExpressionAndGetArrowFunction(path);

        const isolatedFunc = getIsolatedArrowFunction({arrowPath});

        if (REPLACEMENT != null) {
          path.get('callee').replaceWith(babelTypes.identifier(REPLACEMENT));
        }

        console.log('isolatedFunc', convertFunctionNodeToParseableString(isolatedFunc));
      },

      Identifier(path: NodePath<babelTypes.Identifier>) {
        if (!this.hasImportedCorrectlyFromModule) {
          return;
        }

        validatePragmaUse(path);
      }
    },
  };
});

function convertFunctionNodeToParseableString<T extends babelTypes.ArrowFunctionExpression>(node: T): string {
  return babelGenerator(node, {minified: true, compact: true, comments: false}).code;
}


/*
In:
  ----------------------------------------------------------
  / other code /

  const foo = $identifier((baz)=>{bar(); baz();});
  ----------------------------------------------------------

Out:
  ----------------------------------------------------------
  / other code /
  
  const foo = Object.assign((baz)=>{bar(); baz();}, {...});
  ----------------------------------------------------------
 */
