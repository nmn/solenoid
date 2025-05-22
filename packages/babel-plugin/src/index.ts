import type { PluginObj, NodePath } from "@babel/core";
import type { BabelAPI } from "@babel/helper-plugin-utils";

import { types as t } from "@babel/core";
import { declare } from "@babel/helper-plugin-utils";
import { addNamed } from "@babel/helper-module-imports";
import { getIsolatedArrowFunctionAndVars } from "./helpers/transformArrowFunction";
import generate from "@babel/generator";
import murmurhash from "murmurhash";

// We don't have plugin options at the moment.
export type PluginOptions = Record<never, never>;

export default declare((api: BabelAPI, _options: PluginOptions): PluginObj => {
	api.assertVersion(7);

	let fnHelperId: t.Identifier;
	let globalName: t.Identifier;
	const fns: Record<string, t.ArrowFunctionExpression> = {};

	return {
		visitor: {
			Program: {
				enter(path: NodePath<t.Program>) {
					fnHelperId = addNamed(
						path,
						"serializableFn",
						"@solenoid/server-runtime",
					);
					globalName = addNamed(path, "globalName", "@solenoid/server-runtime");
				},
				exit(path: NodePath<t.Program>) {
					for (const [name, value] of Object.entries(fns)) {
						path.node.body.unshift(
							t.variableDeclaration("const", [
								t.variableDeclarator(t.identifier(name), value),
							]),
						);
					}
				},
			},
			ArrowFunctionExpression: {
				enter(arrowPath: NodePath<t.ArrowFunctionExpression>) {
					let fnName = null;
					if (
						arrowPath.parentPath.isVariableDeclarator() &&
						arrowPath.parentPath.node.id.type === "Identifier"
					) {
						fnName = arrowPath.parentPath.node.id.name;
					}

					const {
						isolatedFunction,
						vars: { closures },
					} = getIsolatedArrowFunctionAndVars(
						arrowPath,
						[fnHelperId.name, globalName.name],
						fnName,
					);

					const fnString = generate(isolatedFunction).code;
					const fnHash = murmurhash.v3(fnString);
					const fnId = `_${fnHash.toString(36)}`;
					const fnIdentifier = t.identifier(fnId);

					fns[fnId] = isolatedFunction;

					const replacement = t.objectExpression([
						t.objectProperty(t.identifier("fn"), fnIdentifier),
						t.objectProperty(
							t.identifier("closure"),
							t.arrowFunctionExpression([], t.arrayExpression(closures)),
						),
						t.objectProperty(
							t.identifier("id"),
							t.stringLiteral(`_${fnHash.toString(36)}`),
						),
					]);

					const withCallExpression = t.callExpression(fnHelperId, [
						replacement,
					]);

					arrowPath.replaceWith(withCallExpression);

					const callExpressionReplacement =
						arrowPath as unknown as NodePath<t.CallExpression>;
					const object = callExpressionReplacement.get(
						"arguments",
					)[0] as NodePath<t.ObjectExpression>;
					const closure = object
						.get("properties")
						.find(
							(propPath) =>
								propPath.isProperty() &&
								propPath.get("key").isIdentifier({ name: "closure" }),
						);
					if (closure != null) {
						const valueFn = closure.get(
							"value",
						) as NodePath<t.ArrowFunctionExpression>;
						const valueArray = valueFn.get(
							"body",
						) as NodePath<t.ArrayExpression>;
						for (const closureVal of valueArray.get("elements")) {
							if (closureVal.isIdentifier()) {
								if (closureVal.scope.hasGlobal(closureVal.node.name)) {
									closureVal.replaceWith(
										t.callExpression(globalName, [
											t.stringLiteral(closureVal.node.name),
										]),
									);
								}
							}
						}
					}

					arrowPath.skip();
				},
			},
		},
	};
});
