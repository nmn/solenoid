import type { NodePath } from '@babel/core';
import type { PluginState, ReplaceArrowFunctionExpression as Replace } from '../types';

import {traverse, types as babelTypes} from '@babel/core';
import getClosuresAndParams from './getClosuresAndParams';
import {PARAM_IDENTIFIER_PREFIX} from '../identifiers.json';

export type TransformOptions = {
  arrowPath: NodePath<babelTypes.ArrowFunctionExpression>,
};

export type Output = babelTypes.ArrowFunctionExpression;

export function getIsolatedArrowFunction(options: TransformOptions): Output {
  const { arrowPath } = options;
  const { closures } = getClosuresAndParams(arrowPath);

  const clonedNode = babelTypes.cloneNode(arrowPath.node, true, true);
  clonedNode.params.unshift(...Array.from(closures).map((str)=>babelTypes.identifier(str)));

  const fakePath = findNodePath(clonedNode);

  const newBindingNames = Object.keys(fakePath.scope.bindings);
  let i = 0;
  newBindingNames.forEach((bindingName)=>{
    fakePath.scope.rename(bindingName, `${PARAM_IDENTIFIER_PREFIX}${i}`);
    i++;
  });

  return fakePath.node;
}

function findNodePath<T extends babelTypes.Expression>(target: T): NodePath<T> {
  let result: NodePath<T> | null = null;

  const fakeProgram = babelTypes.file(babelTypes.program([
    babelTypes.expressionStatement(target)
  ]));

  traverse(fakeProgram, {
    enter(path) {
      if (path.node === target) {
        result = path as NodePath<T>;
        path.stop();
      }
    }
  });

  if (!result) {
    throw new Error("NodePath not found");
  }

  return result as NodePath<T>;
}
