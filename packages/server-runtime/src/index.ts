import { type AnyFunction, type SolenoidFunctionConfig, SOLENOID_CUSTOM_KEY, SOLENOID_OBJECT_TYPES } from "@solenoid/custom-elements/dist/utils/types";

type SerializableFn<C extends any[] = any[], A extends AnyFunction = AnyFunction> = (...c: C)=>A;

type ClosureOf<F extends SerializableFn> = F extends SerializableFn<infer C> ? C : never;
type ArrowOf<F extends SerializableFn> = F extends SerializableFn<any[], infer A> ? A : never;


type SerializableFnConf<F extends SerializableFn> = {
  fn: F,

  closure: ()=>ClosureOf<F>,
  id: string,
};

export function serializableFn<T extends SerializableFn>({fn, closure, id}: SerializableFnConf<T>): ArrowOf<T> & SolenoidFunctionConfig<ClosureOf<T>> {
  const closureVars = closure();
  const fnWithClosuresFilled = fn(...closureVars);

  const config = {
    [SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function,
    closure,
    id,
    module: JSON.stringify(fn),
  };

  Object.assign(fnWithClosuresFilled, config);

  return fnWithClosuresFilled as ArrowOf<typeof fn> & SolenoidFunctionConfig<typeof closureVars>;
}
