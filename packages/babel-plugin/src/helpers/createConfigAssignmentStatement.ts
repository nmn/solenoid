import type { SolenoidFunctionConfig } from '@solenoid/custom-elements/dist/utils/types';

import { types as babelTypes } from '@babel/core';
import { SOLENOID_CUSTOM_KEY, SOLENOID_OBJECT_TYPES } from '@solenoid/custom-elements/dist/utils/types';

type NodesForConfig = {
  args: readonly babelTypes.Identifier[];
  closure: readonly babelTypes.Identifier[];
};

type BabelTransformableSolenoidConfig = Omit<SolenoidFunctionConfig, keyof NodesForConfig>;

export default function createConfigAssignmentStatement(
  func: babelTypes.ArrowFunctionExpression,
  preStaticConfig: Omit<BabelTransformableSolenoidConfig, typeof SOLENOID_CUSTOM_KEY>,
  nodesForConfig: NodesForConfig,
): babelTypes.CallExpression {
  const staticConfig: BabelTransformableSolenoidConfig = {
    ...preStaticConfig,
    [SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function,
  };
  
  const config = babelTypes.valueToNode(staticConfig);

  config.properties.push(
    ...Object.entries(nodesForConfig).map(([key, statements])=>babelTypes.objectProperty(
        babelTypes.identifier(key),
        babelTypes.arrayExpression([...statements]),
    ))
  );

  return createObjectAssignStatement(func, config);
}

function createObjectAssignStatement(value: babelTypes.Expression, assignment: babelTypes.Expression): babelTypes.CallExpression {
  return babelTypes.callExpression(
    babelTypes.memberExpression(babelTypes.identifier('Object'), babelTypes.identifier('assign')),
    [value, assignment],
  );
}
