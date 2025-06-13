import { renderToStream } from "@solenoid/server-runtime";
import { Static } from "./components/Static";

const stream = renderToStream(<Static />);

for await (const chunk of stream) {
	console.log(chunk);
}
