import type {NodePath} from '@babel/core';

import * as babelTypes from '@babel/types';
import { PRAGMA } from '../identifiers.json';

export default function validateCallExpressionAndGetArrowFunction(path: NodePath<babelTypes.CallExpression>): NodePath<babelTypes.ArrowFunctionExpression> {
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

  return func;
}
