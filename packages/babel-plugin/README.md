# `@solenoid/babel-plugin`

This package is to transpile your server code into [fully `JSON.parse`-able values](https://github.com/nmn/solenoid/tree/main/packages/babel-plugin#solenoid-configs) for the client to hydrate.

## Installation

```zsh
# With bun (https://bun.sh/)
bun install --dev @solenoid/babel-plugin

# With npm
npm install --save-dev @solenoid/babel-plugin
```


## Example

### In:
```ts
const N = 1;

const addN = (a: number): number => a + N;

function subN(a: number): number {
  return a - N;
}
```

### Out:
```ts
import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";

const _1jtluhg = $$closure => {
  const [$c0] = $$closure();
  const $r = a => a + $c0;
  return $r;
};

const N = 1;

const addN = _serializableFn({
  fn: _1jtluhg,
  closure: () => [N],
  id: "_1jtluhg"
});

// This is unchanged as expected. Only arrow functions will be transpiled as they are lexically bound.
function subN(a: number): number {
  return a - N;
}
```

## Explanation

- Arrow functions (`(...)=>...`) are `lexically bound`, this makes it possible to completely "seal" them into a serialization.
  - > [Arrow functions differ in their handling of this: they inherit this from the parent scope at the time they are defined. This behavior makes arrow functions particularly useful for callbacks and preserving context.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#:~:text=Arrow%20functions%20differ%20in%20their%20handling%20of%20this%3A%20they%20inherit%20this%20from%20the%20parent%20scope%20at%20the%20time%20they%20are%20defined.%20This%20behavior%20makes%20arrow%20functions%20particularly%20useful%20for%20callbacks%20and%20preserving%20context.)
