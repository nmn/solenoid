import { renderToStream } from "@solenoid/server-runtime";
import { Counter } from "./components/Counter";

// @ts-ignore
const stream = renderToStream(<Counter />);

console.log(stream.next);

for await (const chunk of stream) {
	console.log("", chunk);
}
