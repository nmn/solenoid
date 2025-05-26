# `@solenoid/custom-elements`

This package sets up the custom elements for solenoid on the client and all tools that those custom elements need to render.

## Installation

```zsh
# With bun (https://bun.sh/)
bun install @solenoid/custom-elements

# With npm
npm install --save @solenoid/custom-elements
```

## Elements
You won't need to use these elements yourself. By using [`@solenoid/server-runtime`](https://github.com/nmn/solenoid/tree/main/packages/server-runtime#readme), these will be created with the helpers.

- `<let-signal>`
  - This sets up a `Signal`.
  - `name` - `string`
    - This is the auto-generated ID the signal will use. Any other signals with the same ID will share the same `Signal` pointer.
  - `initial-value` - stringified [solenoid Config](#solenoid-configs)
    - This is the value that will hydrated and set *if initializing*.
- `<signal-text>`
  - This subscribes to a signal to render its value directly into the DOM.
  - `value` - stringified [solenoid Config](#solenoid-configs)
- `<signal-attrs>`
  - This invokes a given function to set attributes to the child.
  - `value` - stringified [solenoid Config](#solenoid-configs)
- `<show-when>`
    - `condition` - stringified [solenoid Config](#solenoid-configs)

> [!NOTE]
> Attributes are always stringified:
> 
> "*[The content attribute is always a string even when the expected value should be an integer. For example, to set an `<input>` element's `maxlength` to 42 using the content attribute, you have to call `setAttribute("maxlength", "42")` on that element.](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes#:~:text=The%20content%20attribute%20is%20always%20a%20string%20even%20when%20the%20expected%20value%20should%20be%20an%20integer.%20For%20example%2C%20to%20set%20an%20%3Cinput%3E%20element%27s%20maxlength%20to%2042%20using%20the%20content%20attribute%2C%20you%20have%20to%20call%20setAttribute(%22maxlength%22%2C%20%2242%22)%20on%20that%20element.)*"

## [solenoid Configs](https://github.com/nmn/solenoid/tree/main/packages/custom-elements/src/utils/types.ts)

solenoid de-serializes values on the client to maintain interactivity.

This is a key part of solenoid, since we do not receive the entire JS that SSR used to render. While HTML elements are being streamed in from the server, solenoid is able to parse and use *most*[¹](#footnotes) values.


## Footnotes

1. Solenoid can translate signals and functions, and any other `JSON.parse`-able value. In the future, a more complex serializing library may be used.
