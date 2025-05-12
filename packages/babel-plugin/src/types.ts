import type * as babelTypes from '@babel/types';
import type {PluginPass} from '@babel/core';
import type { ImportInjector } from '@babel/helper-module-imports';

declare module '@babel/helper-module-imports' {
  interface ImportInjector {
    // Hidden method to insert statements after imports
    _insertStatementsAfter(statements: babelTypes.Statement[]): boolean;
  }
}

export type { ImportInjector };

export interface PluginState extends PluginPass {
  injectTopLevel: ImportInjector['_insertStatementsAfter']
}

export interface Options {}

