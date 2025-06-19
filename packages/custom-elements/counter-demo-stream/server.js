const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const { Transform } = require("node:stream");

const app = express();
const port = 3000;

// Serve static files from the lib directory
app.use("/lib", express.static(path.join(__dirname, "../lib")));

// Create a transform stream that adds delays between lines
class DelayStream extends Transform {
	constructor(delayMs = 100) {
		super();
		this.delayMs = delayMs;
		this.buffer = "";
	}

	_transform(chunk, encoding, callback) {
		this.buffer += chunk;
		const lines = this.buffer.split("\n");

		// Keep the last line in the buffer if it's incomplete
		this.buffer = lines.pop();

		// Process each complete line
		const processLine = async (line) => {
			if (line.trim()) {
				this.push(`${line}\n`);
				await new Promise((resolve) => setTimeout(resolve, this.delayMs));
			}
		};

		// Process lines sequentially
		(async () => {
			for (const line of lines) {
				await processLine(line);
			}
			callback();
		})();
	}

	_flush(callback) {
		if (this.buffer) {
			this.push(this.buffer);
		}
		callback();
	}
}

app.get("/", (req, res) => {
	const delay = Number.parseInt(req.query.delay) || 100; // Default 100ms delay
	const filePath = path.join(__dirname, "index.html");

	res.setHeader("Content-Type", "text/html");

	const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
	const delayStream = new DelayStream(delay);

	fileStream.pipe(delayStream).pipe(res);
});

app.listen(port, () => {
	console.log("Server running at http://localhost:3000");
	console.log(
		"Add ?delay=500 to the URL to change the delay between lines (in milliseconds)",
	);
});
