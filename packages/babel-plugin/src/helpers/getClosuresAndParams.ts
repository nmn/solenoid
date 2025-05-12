import type { NodePath } from '@babel/core';

import * as babelTypes from '@babel/types';
import { PRAGMA } from '../identifiers.json';

type Identifiers = string[];

type Result = {
  params: Identifiers,
  closures: Identifiers,
};

export default function getClosuresAndParams(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>): Result {
  const paramsSet = getParams(arrowPath);
  const closuresSet = getClosures(arrowPath, paramsSet);

  closuresSet.delete(PRAGMA); // this will be transformed by babel, don't include it as a closure
  
  return {
    params: Array.from(paramsSet),
    closures: Array.from(closuresSet),
  };
}

function getParams(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>): Set<string> {
  const set = new Set<string>(Object.entries(arrowPath.scope.bindings)
    .filter(([, binding]) => binding.kind === 'param')
    .map(([name]) => name))

  return set;
}

function getClosures(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>, paramsSet: Set<string>): Set<string> {
  const set = new Set<string>();

  arrowPath.get('body').traverse({
    Identifier(identifierPath) {
      if (!isClosureIdentifier(arrowPath, paramsSet, identifierPath)) {
        return;
      }

      set.add(identifierPath.node.name);
    }
  });

  return set;
}

function isClosureIdentifier(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>, paramsSet: Set<string>, path: NodePath<babelTypes.Identifier>): boolean {
  const name = path.node.name;

  if (
    path.parent.type === 'MemberExpression' &&
    path.parent.property === path.node &&
    !path.parent.computed
  ) {
    return false;
  }

  // If it's a param or declared in the arrow's body, skip it
  const binding = path.scope.getBinding(name);
  if (
    (binding?.scope === arrowPath.scope) ||
    paramsSet.has(name)
  ) {
    return false;
  }

  return true;
}