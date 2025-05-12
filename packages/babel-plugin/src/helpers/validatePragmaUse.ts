import type {NodePath} from '@babel/core';

import * as babelTypes from '@babel/types';
import { PRAGMA } from '../identifiers.json';

export default function validatePragmaUse(path: NodePath<babelTypes.Identifier>) {
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
