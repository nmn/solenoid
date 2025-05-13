// function solenize<T extends (...args: any[])=>any, U extends SolenoidFunctionConfig>(value: T, config: U): SolenoidFunction<T>;
// function solenize<T extends any, U extends SolenoidSignalConfig>(value: Signal<T>, config: U): SolenoidSignal<T>;
// function solenize<T = any>(value: T, config: U): T & SolenoidObject<U> {
//   Object.defineProperty(value, SOLENOID_CUSTOM_KEY, {
//     value: config,
//     configurable: false,
//     writable: false,
//     enumerable: false,
//   });

//   return value as T & SolenoidObject<U>;
// }

// export {solenize};
