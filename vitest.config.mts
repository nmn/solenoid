import { createRequire } from 'module';
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
const require = createRequire(import.meta.url);
const testSetupFile = require.resolve('./test-setup.js')

export default defineConfig({
	test: {
		environment: 'jsdom',
		exclude: [
			"packages/*/lib",
			// defaults from vitest
			"**/node_modules/**",
			"**/dist/**",
			"**/cypress/**",
			"**/.{idea,git,cache,output,temp}/**",
			"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
		],
		setupFiles: [testSetupFile]
	},
	plugins: [tsconfigPaths()],
});
