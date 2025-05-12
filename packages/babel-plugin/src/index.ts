import type {PluginObj, NodePath} from '@babel/core';
import type { BabelAPI } from '@babel/helper-plugin-utils';
import type {PluginOptions, PluginState} from './types';

import * as babelTypes from '@babel/types';
import { declare } from "@babel/helper-plugin-utils";
import { ImportInjector } from '@babel/helper-module-imports';
import { PRAGMA, REPLACEMENT } from './identifiers.json';
import transformArrowFunction from './helpers/transformArrowFunction';
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
          const injector = new ImportInjector(programPath);

          // TODO: Get module-level identifiers so injectTopLevel doesn't collide.
          state.injectTopLevel = (arrowPath: NodePath<babelTypes.ArrowFunctionExpression>) => {
            const {inject, replace, injectedFunctionName} = transformArrowFunction({arrowPath, state, programPath});

            const injected = injector._insertStatementsAfter(inject);

            if (!injected) {
              throw programPath.buildCodeFrameError('Failed to compile');
            }

            return [replace, injectedFunctionName];
          };
        }
      },

      CallExpression(path: NodePath<babelTypes.CallExpression>, state) {
        const { callee } = path.node;

        if (!babelTypes.isIdentifier(callee, { name: PRAGMA })) {
          return; 
        }

        const func = validateCallExpressionAndGetArrowFunction(path);

        const [replace, injectedFunctionName] = state.injectTopLevel(func);

        func.replaceExpressionWithStatements(replace);

        path.get('callee').replaceWith(babelTypes.identifier(REPLACEMENT));

        // const bindings = path.scope.getAllBindings();
        // console.log('bindings', bindings);
      },

      Identifier(path: NodePath<babelTypes.Identifier>) {
        validatePragmaUse(path);
      }
    },
  };
});


/*
In:
  ----------------------------------------------------------
  / other code /

  const foo = $identifier((baz)=>{bar(); baz();};
  ----------------------------------------------------------

Out:
  ----------------------------------------------------------
  const $f1 = ($c1)=>($p1)=>{$c1(); $p1();}
  Object.defineProperty($f1, ...otherStuff);

  / other code /
  
  const foo = ($f1(baz));
  ----------------------------------------------------------
 */
