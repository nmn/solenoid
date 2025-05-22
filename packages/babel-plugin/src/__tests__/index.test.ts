import { describe, expect, test } from "vitest";
import { transformSync } from "@babel/core";
import solenoidPlugin, {type PluginOptions} from "../../src";

function transform(code: string, options: PluginOptions = {}): string | null | undefined {
	const res = transformSync(code as string, {
		plugins: [
			["@babel/plugin-syntax-typescript", { isTSX: true }],
			[solenoidPlugin, options],
		],
		filename: "foo.ts",
		configFile: false,
		babelrc: false,
	});

	return res?.code;
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
      });"
    `);
	});

	test("simple arrow function in an object", () => {
		const code = `
      const N = 1;
      const fns = {
        addN: (a) => a + N
      };
    `;
		const transformedCode = transform(code);

		expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _1jtluhg = $$closure => {
        const [$c0] = $$closure();
        const $r = a => a + $c0;
        return $r;
      };
      const N = 1;
      const fns = {
        addN: _serializableFn({
          fn: _1jtluhg,
          closure: () => [N],
          id: "_1jtluhg"
        })
      };"
    `);
	});

	test("arrow function that refers to another arrow fn", () => {
		const code = `
      const N = 10;
      const addN = (a) => a + N;
      const useAddN = (a) => addN(a, N);
    `;
		const transformedCode = transform(code);

		expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _1g61rwf = $$closure => {
        const [$c0, $c1] = $$closure();
        const $r = a => $c0(a, $c1);
        return $r;
      };
      const _1jtluhg = $$closure => {
        const [$c0] = $$closure();
        const $r = a => a + $c0;
        return $r;
      };
      const N = 10;
      const addN = _serializableFn({
        fn: _1jtluhg,
        closure: () => [N],
        id: "_1jtluhg"
      });
      const useAddN = _serializableFn({
        fn: _1g61rwf,
        closure: () => [addN, N],
        id: "_1g61rwf"
      });"
    `);
	});

	test("counter component", () => {
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
      const _db4zf6 = $$closure => {
        const [$c0] = $$closure();
        const $r = () => $c0($c0() - 1);
        return $r;
      };
      const _hxdr80 = $$closure => {
        const [$c0] = $$closure();
        const $r = () => $c0($c0() + 1);
        return $r;
      };
      function MyComponent() {
        const count = signal(0);
        const increment = _serializableFn({
          fn: _hxdr80,
          closure: () => [count],
          id: "_hxdr80"
        });
        const decrement = _serializableFn({
          fn: _db4zf6,
          closure: () => [count],
          id: "_db4zf6"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={increment}>+</button>
                </div>;
      }"
    `);
	});

	test("Slightly more", () => {
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
      const _1xwtz1r = $$closure => {
        const [$c0] = $$closure();
        const $r = event => {
          event.preventDefault();
          $c0($c0() - 1);
        };
        return $r;
      };
      const _bgh3uu = $$closure => {
        const [$c0] = $$closure();
        const $r = event => {
          event.preventDefault();
          $c0($c0() + 1);
        };
        return $r;
      };
      function MyComponent() {
        const count = signal(0);
        const increment = _serializableFn({
          fn: _bgh3uu,
          closure: () => [count],
          id: "_bgh3uu"
        });
        const decrement = _serializableFn({
          fn: _1xwtz1r,
          closure: () => [count],
          id: "_1xwtz1r"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={increment}>+</button>
                </div>;
      }"
    `);
	});

	test("nested arrow functions", () => {
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
      const _1u6a343 = $$closure => {
        const [$c0] = $$closure();
        const $r = event => {
          const increment = () => {
            $c0($c0() + 1);
          };
          event.preventDefault();
          increment();
        };
        return $r;
      };
      const _1xwtz1r = $$closure => {
        const [$c0] = $$closure();
        const $r = event => {
          event.preventDefault();
          $c0($c0() - 1);
        };
        return $r;
      };
      function MyComponent() {
        const count = signal(0);
        const decrement = _serializableFn({
          fn: _1xwtz1r,
          closure: () => [count],
          id: "_1xwtz1r"
        });
        const onIncrementClick = _serializableFn({
          fn: _1u6a343,
          closure: () => [count],
          id: "_1u6a343"
        });
        return <div>
                  <button onClick={decrement}>-</button>
                  <span>{count()}</span>
                  <button onClick={onIncrementClick}>+</button>
                </div>;
      }"
    `);
	});

	test("using globals", () => {
		const code = `
      function MyComponent() {
        const innerWidth = signal(() => window.innerWidth);
      }
    `;
		const transformedCode = transform(code);

		expect(transformedCode).toMatchInlineSnapshot(`
      "import { serializableFn as _serializableFn, globalName as _globalName } from "@solenoid/server-runtime";
      const _14981cm = $$closure => {
        const [$c0] = $$closure();
        const $r = () => $c0.innerWidth;
        return $r;
      };
      function MyComponent() {
        const innerWidth = signal(_serializableFn({
          fn: _14981cm,
          closure: () => [_globalName("window")],
          id: "_14981cm"
        }));
      }"
    `);
	});

	test("using globals for an effect", () => {
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
      const _1lnmtat = $$closure => {
        const [$c0, $c1] = $$closure();
        const $r = () => {
          const onResize = () => {
            $c0($c1.innerWidth);
          };
          onResize();
          $c1.addEventListener('resize', onResize);
          return () => {
            $c1.removeEventListener('resize', onResize);
          };
        };
        return $r;
      };
      function MyComponent() {
        const innerWidth = signal(760);
        effect(_serializableFn({
          fn: _1lnmtat,
          closure: () => [innerWidth, _globalName("window")],
          id: "_1lnmtat"
        }));
      }"
    `);
	});

	test("closure only in nested arrow function", () => {
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
      const _1ofw1jn = $$closure => {
        const [$c0, $c1] = $$closure();
        const $r = el => {
          const onResize = () => {
            $c0($c1.innerWidth);
          };
          onResize();
          el.addEventListener('resize', onResize);
          return () => {
            el.removeEventListener('resize', onResize);
          };
        };
        return $r;
      };
      const _1xdcgvu = $$closure => {
        const [$c0, $c1] = $$closure();
        const $r = () => {
          $c0($c1.innerWidth);
        };
        return $r;
      };
      function MyComponent() {
        const innerWidth = signal(760);
        const onClick = _serializableFn({
          fn: _1xdcgvu,
          closure: () => [innerWidth, _globalName("window")],
          id: "_1xdcgvu"
        });
        effect(_serializableFn({
          fn: _1ofw1jn,
          closure: () => [innerWidth, _globalName("window")],
          id: "_1ofw1jn"
        }));
      }"
    `);
	});

	test("recursion", () => {
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
      const _1vzf6mg = $$closure => {
        const [$c0, $c1, $c2, $c3, $r] = $$closure();
        const $r = () => {
          $c0($c1.innerWidth);
          $c2.current = $c3(() => {
            $r();
          }, 1000);
        };
        return $r;
      };
      function MyComponent() {
        const innerWidth = signal(760);
        const timeoutRef = ref(0);
        const onClick = _serializableFn({
          fn: _1vzf6mg,
          closure: () => [innerWidth, _globalName("window"), timeoutRef, _globalName("setTimeout"), onClick],
          id: "_1vzf6mg"
        });
      }"
    `);
	});
});
