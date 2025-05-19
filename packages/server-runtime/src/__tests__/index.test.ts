import { describe, expect, test } from "vitest";
import { serializableFn } from "..";

describe('server-runtime', ()=>{
  describe('serializableFn', ()=>{
    test('works on overloaded functions', ()=>{
      function build<T extends string>(param: T): {str: T};
      function build<T extends number>(param: T): {num: T};
      function build<T extends string | number>(param: T) {
        if (typeof param === 'string') {
          return {str: param};
        }
        return {num: param};
      }

      const numParam = 3;
      expect(serializableFn({
        fn: ()=>build,
        closure: (): []=>[],
        id: '',
      })(numParam).num).toBe(numParam);

      const stringParam = 'foo';
      expect(serializableFn({
        fn: ()=>build,
        closure: (): []=>[],
        id: '',
      })(stringParam).str).toBe(stringParam);
    });
  });
});
