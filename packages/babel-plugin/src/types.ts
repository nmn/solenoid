import type {types as babelTypes} from '@babel/core';
import type { PluginPass } from '@babel/core';

// using tuples here in case we want to inject more
export type ReplaceArrowFunctionExpression = [babelTypes.ExpressionStatement];

export type PluginState = PluginPass;

export type PluginOptions = Record<never, never>;

