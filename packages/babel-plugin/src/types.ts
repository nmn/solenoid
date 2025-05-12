import type * as babelTypes from '@babel/types';
import type {NodePath, PluginPass} from '@babel/core';
import type { ImportInjector } from '@babel/helper-module-imports';

declare module '@babel/helper-module-imports' {
  interface ImportInjector {
    // Hidden method to insert statements after imports
    _insertStatementsAfter(statements: babelTypes.Statement[]): boolean;
  }
}

export type { ImportInjector };

export type InjectTopLevelFunctionExpression = [babelTypes.FunctionDeclaration];

export type ReplaceArrowFunctionExpression = [babelTypes.ExpressionStatement];

export type InjectedFunctionName = string;

export interface PluginState extends PluginPass {
  injectTopLevel(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>): [ReplaceArrowFunctionExpression, InjectedFunctionName];
  counter: number;
}

export interface PluginOptions {}
