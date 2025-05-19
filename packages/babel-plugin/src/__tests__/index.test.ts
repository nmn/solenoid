import { describe, expect, test } from "vitest";
import {type PluginOptions, transformSync} from '@babel/core';
import solenoidPlugin from '../../src'

function transform<T>(
	code: string,
	options: PluginOptions = {},
): string {
	const res = transformSync(code as string, {
		plugins: [
		  ["@babel/plugin-syntax-typescript", {isTSX: true}],
		  [solenoidPlugin, options]
		],
		filename: "foo.ts",
		configFile: false,
		babelrc: false,
	});

	return res.code
}


describe("Babel Plugin tests", async () => {
  test("simple arrow function", () => {
    const code = `
      const N = 1;
      const addN = (a) => a + N;
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _10eff6n = ($p0, $p1) => $p1 + $p0;
      const N = 1;
      const addN = _serializableFn({
        fn: _10eff6n,
        closure: [N],
        id: "_10eff6n"
      });"
    `)
  });

  test("arrow function that refers to another arrow fn", () => {
    const code = `
      const N = 10;
      const addN = (a) => a + N;
      const useAddN = (a) => addN(a, N);
    `
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _5e4vi8 = ($p0, $p1, $p2) => $p0($p2, $p1);
      const _10eff6n = ($p0, $p1) => $p1 + $p0;
      const N = 10;
      const addN = _serializableFn({
        fn: _10eff6n,
        closure: [N],
        id: "_10eff6n"
      });
      const useAddN = _serializableFn({
        fn: _5e4vi8,
        closure: [addN, N],
        id: "_5e4vi8"
      });"
    `)
  });

  test('counter component', () => {
    const code = `
      function MyComponent() {
        const count = signal(0);
        const increment = () => count(count() + 1);
        const decrement = () => count(count() - 1);

        return (
          <div>
            <button onClick={decrement}>-</button>
            <span>{count()}</span>
            <button onClick={increment}>+</button>
          </div>
        );
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _1dgft2j = $p0 => $p0($p0() - 1);
      const _1whaks8 = $p0 => $p0($p0() + 1);
      function MyComponent() {
        const count = signal(0);
        const increment = _serializableFn({
          fn: _1whaks8,
          closure: [count],
          id: "_1whaks8"
        });
        const decrement = _serializableFn({
          fn: _1dgft2j,
          closure: [count],
          id: "_1dgft2j"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={increment}>+</button>
                </div>;
      }"
    `)
  })

  test('Slightly more', () => {
    const code = `
      function MyComponent() {
        const count = signal(0);
        const increment = (event) => {
          event.preventDefault();
          count(count() + 1);
        };
        const decrement = (event) => {
          event.preventDefault();
          count(count() - 1);
        };

        return (
          <div>
            <button onClick={decrement}>-</button>
            <span>{count()}</span>
            <button onClick={increment}>+</button>
          </div>
        );
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _1jl7q9a = ($p0, $p1) => {
        $p1.preventDefault();
        $p0($p0() - 1);
      };
      const _1i0w8l1 = ($p0, $p1) => {
        $p1.preventDefault();
        $p0($p0() + 1);
      };
      function MyComponent() {
        const count = signal(0);
        const increment = _serializableFn({
          fn: _1i0w8l1,
          closure: [count],
          id: "_1i0w8l1"
        });
        const decrement = _serializableFn({
          fn: _1jl7q9a,
          closure: [count],
          id: "_1jl7q9a"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={increment}>+</button>
                </div>;
      }"
    `)
  });

  test('nested arrow functions', () => {
    const code = `
      function MyComponent() {
        const count = signal(0);

        const decrement = (event) => {
          event.preventDefault();
          count(count() - 1);
        };
        const onIncrementClick = (event) => {
          const increment = () => {
            count(count() + 1);
          };
          event.preventDefault();
          increment();
        };

        return (
          <div>
            <button onClick={decrement}>-</button>
            <span>{count()}</span>
            <button onClick={onIncrementClick}>+</button>
          </div>
        );
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _1f6dm1b = ($p0, $p1) => {
        const $p2 = () => {
          $p0($p0() + 1);
        };
        $p1.preventDefault();
        $p2();
      };
      const _1jl7q9a = ($p0, $p1) => {
        $p1.preventDefault();
        $p0($p0() - 1);
      };
      function MyComponent() {
        const count = signal(0);
        const decrement = _serializableFn({
          fn: _1jl7q9a,
          closure: [count],
          id: "_1jl7q9a"
        });
        const onIncrementClick = _serializableFn({
          fn: _1f6dm1b,
          closure: [count],
          id: "_1f6dm1b"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={onIncrementClick}>+</button>
                </div>;
      }"
    `);
  });


  test('using globals', () => {
    const code = `
      function MyComponent() {
        const innerWidth = signal(() => window.innerWidth);
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _f6dq2x = $p0 => $p0.innerWidth;
      function MyComponent() {
        const innerWidth = signal(_serializableFn({
          fn: _f6dq2x,
          closure: [_globalName("window")],
          id: "_f6dq2x"
        }));
      }"
    `);
  });

  test('using globals for an effect', () => {
    const code = `
      function MyComponent() {
        const innerWidth = signal(760);
        effect(() => {
          const onResize = () => {
            innerWidth(window.innerWidth)
          };
          onResize();
          window.addEventListener('resize', onResize);
          return () => {
            window.removeEventListener('resize', onResize);
          };
        });
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _sn5d5g = ($p0, $p1) => {
        const $p2 = () => {
          $p0($p1.innerWidth);
        };
        $p2();
        $p1.addEventListener('resize', $p2);
        return () => {
          $p1.removeEventListener('resize', $p2);
        };
      };
      function MyComponent() {
        const innerWidth = signal(760);
        effect(_serializableFn({
          fn: _sn5d5g,
          closure: [innerWidth, _globalName("window")],
          id: "_sn5d5g"
        }));
      }"
    `);
  });

  test('closure only in nested arrow function', () => {
    const code = `
      function MyComponent() {
        const innerWidth = signal(760);
        const onClick = () => {
          innerWidth(window.innerWidth)
        };
        effect((el) => {
          const onResize = () => {
            innerWidth(window.innerWidth)
          };
          onResize();
          el.addEventListener('resize', onResize);
          return () => {
            el.removeEventListener('resize', onResize);
          };
        });
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _7i5hid = ($p0, $p1, $p2) => {
        const $p3 = () => {
          $p0($p1.innerWidth);
        };
        $p3();
        $p2.addEventListener('resize', $p3);
        return () => {
          $p2.removeEventListener('resize', $p3);
        };
      };
      const _1acckdb = ($p0, $p1) => {
        $p0($p1.innerWidth);
      };
      function MyComponent() {
        const innerWidth = signal(760);
        const onClick = _serializableFn({
          fn: _1acckdb,
          closure: [innerWidth, _globalName("window")],
          id: "_1acckdb"
        });
        effect(_serializableFn({
          fn: _7i5hid,
          closure: [innerWidth, _globalName("window")],
          id: "_7i5hid"
        }));
      }"
    `);
  });


  test('recursion', () => {
    const code = `
      function MyComponent() {
        const innerWidth = signal(760);
        const timeoutRef = ref(0);
        const onClick = () => {
          innerWidth(window.innerWidth)
          timeoutRef.current = setTimeout(() => {
            onClick();
          }, 1000);
        };
      }
    `;
    const transformedCode = transform(code);

    expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _kexl8w = ($p0, $p1, $p2, $p3, $p4) => {
        $p0($p1.innerWidth);
        $p2.current = $p3(() => {
          $p4();
        }, 1000);
      };
      function MyComponent() {
        const innerWidth = signal(760);
        const timeoutRef = ref(0);
        const onClick = _serializableFn({
          fn: _kexl8w,
          closure: [innerWidth, _globalName("window"), timeoutRef, _globalName("setTimeout"), onClick],
          id: "_kexl8w"
        });
      }"
    `);
  });
});
