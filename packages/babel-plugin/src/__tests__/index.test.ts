import type {BabelFileResult} from '@babel/core';

import * as babel from '@babel/core';
import {describe, it, expect} from 'vitest';
import plugin from '../index';
import {PRAGMA} from '../identifiers.json';

describe('Babel Plugin', ()=>{
  it('correctly converts a function to string and back', ()=>{
    const fn = /* js */ `
      const t = ()=>null;

      
      ${PRAGMA}(({b: {z}} = {b: {z: null}})=>{ t(); return -151;});
    `;
    const [output, createFn] = transform<()=>-151>(fn);

    console.log('output', output);

    const fnAfterCompilation = createFn();

    expect(fnAfterCompilation()).toBe(-151);
  });

  // it('errors if you use the pragma incorrectly', ()=>{
  //   const fn = /* js */ `
  //     ${PRAGMA}(function() { return -151; });
  //   `;

  //   expect(()=>transform<()=>-151>(fn)).toThrow();

  //   const passAsArgument = /* js */ `
  //     foo(${PRAGMA});
  //   `;

  //   expect(()=>transform<()=>void>(fn)).toThrow();
  // });
});

function transform<T>(code: string): [
  NonNullable<BabelFileResult['code']>,
  ()=>T
] {
  const res = babel.transformSync(code as string, {
    plugins: [plugin],
    configFile: false,
    babelrc: false,
  });

  const output = (res as NonNullable<typeof res>).code as string;

  return [output, ()=>eval(output)];
}
