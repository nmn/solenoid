import type { NodePath } from '@babel/core';
import type { InjectedFunctionName, InjectTopLevelFunctionExpression as Inject, PluginState, ReplaceArrowFunctionExpression as Replace } from '../types';

import * as babelTypes from '@babel/types';
import { PRAGMA, HOISTED_FUNCTION_NAME_PREFIX } from '../identifiers.json';
import getClosuresAndParams from './getClosuresAndParams';


type Options = {
  arrowPath: NodePath<babelTypes.ArrowFunctionExpression>,
  programPath: NodePath<babelTypes.Program>,
  state: PluginState,
};

type Output = {
  // using arrays here in case we want to inject more
  inject: Inject;
  replace: Replace;
  injectedFunctionName: InjectedFunctionName;
};

export default function transformArrowFunction(options: Options): Output {
  const { arrowPath, state } = options;
  const { closures } = getClosuresAndParams(arrowPath);

  const { transformed, identifierName } = transformArrowFunctionToTopLevelInjection(options, closures);

  console.log('transformed', transformed);


  return {inject: transformed, injectedFunctionName: identifierName, replace: [] as unknown as Output['replace']};
}


function transformArrowFunctionToTopLevelInjection(options: Options, closures: string[]): {transformed: Output['inject'], identifierName: string} {
  const {arrowPath} = options;

  const identifierName = createHoistedFunctionName(options);

  const allParams = [
    ...closures.map(name => babelTypes.identifier(name)),
    ...arrowPath.node.params,
  ];

  const transformed = [babelTypes.functionDeclaration(
    babelTypes.identifier(identifierName),
    allParams,
    arrowPath.node.body,
    false,
    false
  )] as Output['inject'];

  return {
    transformed,
    identifierName,
  };
}

function createHoistedFunctionName({arrowPath, state}: Options) {
  let identifier = `${HOISTED_FUNCTION_NAME_PREFIX}${state.counter}`;
  while (arrowPath.scope.hasBinding(identifier)) {
    state.counter++;
    identifier = `${HOISTED_FUNCTION_NAME_PREFIX}${state.counter}`;
  }

  return identifier;
}
