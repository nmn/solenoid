import { type AnyFunction, type SolenoidFunctionConfig, SOLENOID_CUSTOM_KEY, SOLENOID_OBJECT_TYPES } from "@solenoid/custom-elements/dist/utils/types";

type SerializableFn<C extends any[] = any[], A extends AnyFunction = AnyFunction> = (...c: C)=>A;

type SerializableFnConf<F extends SerializableFn> = {
  fn: F,

  closure: ()=>Parameters<F>,
  id: string,
};

export function serializableFn<T extends SerializableFn>({fn, closure, id}: SerializableFnConf<T>): ReturnType<T> & SolenoidFunctionConfig<Parameters<T>> {
  const closureVars = closure();
  const fnWithClosuresFilled = fn(...closureVars) as ReturnType<typeof fn>;

  const config: SolenoidFunctionConfig<typeof closureVars> = {
    [SOLENOID_CUSTOM_KEY]: SOLENOID_OBJECT_TYPES.Function,
    closure: closureVars,
    id,
    module: fn.toString(),
  };

  return Object.assign(fnWithClosuresFilled, config);
}
