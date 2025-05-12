import type {PluginObj, NodePath} from '@babel/core';
import type { BabelAPI } from '@babel/helper-plugin-utils';
import type {Options, PluginState} from './types';

import * as babelTypes from '@babel/types';
import { declare } from "@babel/helper-plugin-utils";
import { ImportInjector } from '@babel/helper-module-imports';
import { PRAGMA, REPLACEMENT } from './identifiers.json';
import getClosuresAndParams from './helpers/getClosuresAndParams';

export default declare<
  Options, 
  // @ts-expect-error There's an issue with DefinitelyTyped here https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72756
  PluginObj<PluginState>
>((api: BabelAPI, options: Options, dirname: string): PluginObj<PluginState> => {
  api.assertVersion(7);

  return {
    visitor: {
      Program: {
        enter(path, state) {
          const injector = new ImportInjector(path);

          // TODO: Get module-level identifiers so injectTopLevel doesn't collide.
          state.injectTopLevel = (...args)=>injector._insertStatementsAfter(...args);
        }
      },

      CallExpression(path: NodePath<babelTypes.CallExpression>, state) {
        const { callee } = path.node;

        if (!babelTypes.isIdentifier(callee, { name: PRAGMA })) {
          return; 
        }
        
        if (path.scope.hasBinding(PRAGMA)) {
          // TODO: Do not error if the PRAGMA was imported from Solenoid
          throw path.buildCodeFrameError(
            `Illegal redefinition of reserved '${PRAGMA}'.`
          );
        }

        const args = path.get('arguments');

        if (args.length !== 1) {
          throw path.buildCodeFrameError(
            `Illegal use of ${PRAGMA}. Only ${PRAGMA}((...)=>{...}) calls are allowed.`
          );
        }

        const [func] = args;

        if (!func.isArrowFunctionExpression()) {
          throw path.buildCodeFrameError(
            `Illegal use of ${PRAGMA}. Only ${PRAGMA}((...)=>{...}) calls are allowed.`
          );
        }

        const {params, closures} = getClosuresAndParams(func);

        console.log('params', params);
        console.log('closures', closures);

        path.get('callee').replaceWith(babelTypes.identifier(REPLACEMENT));
        // const bindings = path.scope.getAllBindings();
        // console.log('bindings', bindings);
      },

      Identifier(path: NodePath<babelTypes.Identifier>) {
        if (path.node.name !== PRAGMA) return;
        if (path.scope.hasBinding(PRAGMA)) return;

        const parent = path.parentPath;

        if (
          parent.isCallExpression() &&
          parent.get('callee') === path
        ) {
          return;
        }

        throw path.buildCodeFrameError(
          `Illegal use of ${PRAGMA}. Only ${PRAGMA}((...)=>{...}) calls are allowed.`
        );
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
