declare const $identifier: <T>(param: T)=>T;

const obj = {foo: 'bar'};
$identifier(()=>obj.foo);
