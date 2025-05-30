import { createRequire } from "module";
import { defineConfig, configDefaults } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
const require = createRequire(import.meta.url);
const pathToPromiseWithResolversPolyfill = require.resolve(
	"promise.withresolvers/auto",
);

export default defineConfig({
	test: {
		environment: "jsdom",
		exclude: ["packages/*/lib", ...configDefaults.exclude],
		setupFiles: [pathToPromiseWithResolversPolyfill],
	},
	plugins: [tsconfigPaths()],
});
