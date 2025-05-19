import type { NodePath } from '@babel/core';

import {traverse, types as babelTypes} from '@babel/core';
import { generate as babelGenerate } from '@babel/generator';
import getClosuresAndParams from './getClosuresAndParams';
import {PARAM_IDENTIFIER_PREFIX} from '../identifiers.json';

export type Output = {
  isolatedFunction: babelTypes.ArrowFunctionExpression,
  vars: {
    closures: babelTypes.Identifier[],
    params: babelTypes.Identifier[],
  }
};

export function getIsolatedArrowFunctionAndVars(
  arrowPath: NodePath<babelTypes.ArrowFunctionExpression>,
  ignoredNames: string[]
): Output {
  const { closures, params } = getClosuresAndParams(arrowPath, ignoredNames);

  const clonedNode = babelTypes.cloneNode(arrowPath.node, true, true);
  clonedNode.params.unshift(...Array.from(closures).map((str)=>babelTypes.identifier(str)));

  const fakePath = createFakePath(clonedNode);

  const newBindingNames = Object.keys(fakePath.scope.bindings);
  let i = 0;
  for (const bindingName of newBindingNames) {
    fakePath.scope.rename(bindingName, `${PARAM_IDENTIFIER_PREFIX}${i}`);
    i++;
  }

  return {
    isolatedFunction: fakePath.node,
    vars: {
      closures: Array.from(closures).map((str)=>babelTypes.identifier(str)),
      params: Array.from(params).map((str)=>babelTypes.identifier(str)),
    }
  };
}

function createFakePath<T extends babelTypes.Expression>(target: T): NodePath<T> {
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
