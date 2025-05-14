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

// using arrays here in case we want to inject more
export type ReplaceArrowFunctionExpression = [babelTypes.ExpressionStatement];

export type PluginState = {
  // If the PRAGMA was imported from the correct module, otherwise it's just a normal variable and we ignore it
  hasImportedPragmaCorrectlyFromModule: boolean;
  counter: number;
} & PluginPass;

export type PluginOptions = {};
