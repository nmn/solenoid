import type { NodePath } from '@babel/core';

import { types as t } from '@babel/core';

type Result = {
  params: Set<string>,
  closures: Set<string>,
};

export default function getClosuresAndParams(
  arrowPath: NodePath<t.ArrowFunctionExpression>,
  ignoredNames: string[]
): Result {
  const params = getParams(arrowPath);
  const closures = getClosures(arrowPath, params, ignoredNames);

  return {
    closures,
    params,
  };
}

function getParams(arrowPath: NodePath<t.ArrowFunctionExpression>): Set<string> {
  const set = new Set<string>(Object.entries(arrowPath.scope.bindings)
    .filter(([, binding]) => binding.kind === 'param')
    .map(([name]) => name))

  return set;
}

function getClosures(arrowPath: NodePath<t.ArrowFunctionExpression>, paramsSet: Set<string>, ignoredNames: string[]): Set<string> {
  const set = new Set<string>();

  arrowPath.get('body').traverse({
    Identifier(identifierPath) {
      if (!isClosureIdentifier(arrowPath, paramsSet, identifierPath, ignoredNames)) {
        return;
      }

      set.add(identifierPath.node.name);
    }
  });

  return set;
}

function isClosureIdentifier(arrowPath: NodePath<t.ArrowFunctionExpression>, paramsSet: Set<string>, path: NodePath<t.Identifier>, ignoredNames: string[]): boolean {
  const name = path.node.name;

  if (ignoredNames.includes(name)) {
    return false;
  }

  // Ignore identifiers used as object key lookup
  if (
    path.parent.type === 'MemberExpression' &&
    path.parent.property === path.node &&
    !path.parent.computed
  ) {
    return false;
  }

  if (
    t.isObjectProperty(path.parent) &&
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
