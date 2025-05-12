import type { NodePath } from '@babel/core';
import type { PluginState } from '../types';

import * as babelTypes from '@babel/types';
import { PRAGMA, HOISTED_FUNCTION_NAME_PREFIX } from '../identifiers.json';


type Options = {
  arrowPath: NodePath<babelTypes.ArrowFunctionExpression>,
  parameters: string[],
  closures: string[],
  programPath: NodePath<babelTypes.Program>,
  state: PluginState,
};

export default function injectHoistedFunction({ arrowPath, closures, programPath, state }: Options) {
  if (!state.hoistedCounter) {
    state.hoistedCounter = 0;
  }

  const hoistedId = babelTypes.identifier(`${HOISTED_FUNCTION_NAME_PREFIX}${state.hoistedCounter}`);

  state.hoistedCounter += 1;

  const allParams = [
    ...closures.map(name => babelTypes.identifier(name)),
    ...arrowPath.node.params,
  ];

  const hoistedFn = babelTypes.functionDeclaration(
    hoistedId,
    allParams,
    arrowPath.node.body,
    false,
    false
  );

  const insertAfter = programPath.get('body').filter(p => p.isImportDeclaration()).pop();
  if (insertAfter) {
    insertAfter.insertAfter(hoistedFn);
  } else {
    programPath.unshiftContainer('body', hoistedFn);
  }

  return hoistedId;
}
