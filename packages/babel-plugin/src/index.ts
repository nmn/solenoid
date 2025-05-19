import type { PluginObj, NodePath } from '@babel/core';
import type { BabelAPI } from '@babel/helper-plugin-utils';
import type { PluginOptions, PluginState } from './types';

import { types as babelTypes } from '@babel/core';
import { declare } from "@babel/helper-plugin-utils";
import createConfigAssignmentStatement from './helpers/createConfigAssignmentStatement';
import {  convertFunctionNodeToParseableString, getIsolatedArrowFunctionAndVars } from './helpers/transformArrowFunction';

export default declare<
  PluginOptions, 
  PluginObj<PluginState>
>((api: BabelAPI, _options: PluginOptions, _dirname: string): PluginObj<PluginState> => {
  api.assertVersion(7);

  return {
    visitor: {
      ArrowFunctionExpression(arrowPath: NodePath<babelTypes.ArrowFunctionExpression>, state) {
        const { isolatedFunction, vars: { closures, params } } = getIsolatedArrowFunctionAndVars(arrowPath);
        const stringified = convertFunctionNodeToParseableString(isolatedFunction);

        arrowPath.replaceWith(
          createConfigAssignmentStatement(
            arrowPath.node,
            { module: stringified },
            { args: params, closure: closures },
          )
        );
      },
    },
  };
});


/*
In:
  ----------------------------------------------------------
  / other code /

  const foo = $identifier((baz)=>{bar(); baz();});
  ----------------------------------------------------------

Out:
  ----------------------------------------------------------
  / other code /
  
  const foo = Object.assign((baz)=>{bar(); baz();}, {...});
  ----------------------------------------------------------
 */
