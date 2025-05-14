import type {types as babelTypes} from '@babel/core';
import type { PluginPass } from '@babel/core';

// using tuples here in case we want to inject more
export type ReplaceArrowFunctionExpression = [babelTypes.ExpressionStatement];

export type PluginState = {
  // If the PRAGMA was imported from solenoid, otherwise it's just a normal variable and we ignore it
  hasImportedPragmaCorrectlyFromModule: boolean;
} & PluginPass;

export type PluginOptions = {};
