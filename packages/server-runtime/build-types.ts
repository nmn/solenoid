import {
	sys as tsSys,
	findConfigFile,
	readConfigFile,
	parseJsonConfigFileContent,
	createCompilerHost,
	createProgram,
} from "typescript";
import { resolve, dirname, relative, basename, isAbsolute } from "node:path";
const projectDir = resolve(import.meta.dir);
const srcDir = resolve(projectDir, "src");
const outDir = resolve(projectDir, "lib");
const tsconfigPath = findConfigFile(projectDir, tsSys.fileExists);

let rootDir = projectDir;
let resolvedConfig: any;
if (tsconfigPath) {
	rootDir = dirname(tsconfigPath);
	resolvedConfig = readConfigFile(tsconfigPath, tsSys.readFile)?.config;
}

const finalParsed = parseJsonConfigFileContent(
	{
		...(resolvedConfig ?? {}),
		compilerOptions: {
			...(resolvedConfig?.compilerOptions ?? {}),
			rootDir: srcDir,
			outDir,

			declaration: true,
			emitDeclarationOnly: true,
			noEmit: false,

			incremental: false,
		},
		exclude: [
			...(resolvedConfig?.exclude ?? []),
			"**/__tests__/**",
			"**/*.test.ts",
			"**/*.spec.ts",
		],
	},
	tsSys,
	rootDir,
);

const rootFiles = finalParsed.fileNames.filter((file) => {
	const rel = relative(srcDir, file);
	return !isAbsolute(rel) && !rel.startsWith("..");
});

const host = createCompilerHost(finalParsed.options);

// const originalWriteFile = host.writeFile;

// host.writeFile = (fileName, data, writeBOM, onError, sourceFiles) => {
// 	if (
// 		!fileName.endsWith(".d.ts") ||
// 		!sourceFiles?.some((source) => {
// 			const rel = relative(srcDir, source.fileName);
// 			return !isAbsolute(rel) && !rel.startsWith("..");
// 		})
// 	) {
// 		return;
// 	}

// 	const flatPath = resolve(outDir, basename(fileName));
// 	originalWriteFile(flatPath, data, writeBOM, onError, sourceFiles);
// };

const program = createProgram(rootFiles, finalParsed.options, host);
const result = program.emit();

process.exit(result.emitSkipped ? 1 : 0);
