import type { NodePath } from "@babel/core";

import { traverse, types as t } from "@babel/core";
import { generate as babelGenerate } from "@babel/generator";
import getClosuresAndParams from "./getClosuresAndParams";

export type Output = {
	isolatedFunction: t.ArrowFunctionExpression;
	vars: {
		closures: t.Identifier[];
		params: t.Identifier[];
	};
};

export function getIsolatedArrowFunctionAndVars(
	arrowPath: NodePath<t.ArrowFunctionExpression>,
	ignoredNames: string[],
	fnName: string | null,
): Output {
	const { closures, params } = getClosuresAndParams(arrowPath, ignoredNames);

	const closureArr = Array.from(closures);
	const closureToInternal = Object.fromEntries(
		closureArr.map((c, i) => [c, `$c${i}`]),
	);

	const paramArr = Array.from(params);
	const paramToInternal = Object.fromEntries(
		paramArr.map((c, i) => [c, `$p${i}`]),
	);

	const clonedNode = t.cloneNode(arrowPath.node, true, true);

	const fnWithClosure = t.arrowFunctionExpression(
		closureArr.map((c) => t.identifier(c)),
		t.blockStatement([
			t.variableDeclaration("const", [
				t.variableDeclarator(t.identifier("$r"), clonedNode),
			]),
			t.returnStatement(t.identifier("$r")),
		]),
	);
	const fakePath = createFakePath(fnWithClosure);

	const newBindingNames = Object.keys(fakePath.scope.bindings);
	let i = 0;
	for (const bindingName of newBindingNames) {
		if (bindingName === fnName) {
			fakePath.scope.rename(bindingName, "$r");
		} else if (closures.has(bindingName)) {
			fakePath.scope.rename(bindingName, closureToInternal[bindingName]);
		} else if (params.has(bindingName)) {
			fakePath.scope.rename(bindingName, paramToInternal[bindingName]);
		} else if (bindingName === "$r") {
		} else {
			fakePath.scope.rename(bindingName, `$v${i}`);
			i++;
		}
	}

	const body = fakePath.node.body as t.BlockStatement;
	body.body.unshift(
		t.variableDeclaration("const", [
			t.variableDeclarator(
				t.arrayPattern(fakePath.node.params),
				t.callExpression(t.identifier("$$closure"), []),
			),
		]),
	);
	fakePath.node.params = [t.identifier("$$closure")];

	return {
		isolatedFunction: fakePath.node,
		vars: {
			closures: Array.from(closures).map((str) => t.identifier(str)),
			params: Array.from(params).map((str) => t.identifier(str)),
		},
	};
}

function createFakePath<T extends t.Expression>(target: T): NodePath<T> {
	let result: NodePath<T> | null = null;

	const fakeProgram = t.file(t.program([t.expressionStatement(target)]));

	traverse(fakeProgram, {
		enter(path) {
			if (path.node === target) {
				result = path as NodePath<T>;
				path.stop();
			}
		},
	});

	if (!result) {
		throw new Error("NodePath not found");
	}

	return result as NodePath<T>;
}
