# js13k-vite-plugins

Collection of [Vite]() plugins and utilities for js13k entries.

## Examples

Example `vite.config.ts` files

### Use all recommendations

Use `js13kViteConfig()` for a quick and easy default configuration.

```ts
import { js13kViteConfig } from 'js13k-vite-plugins';
import { defineConfig } from 'vite';

export default defineConfig(js13kViteConfig());
```

### Use plugins individually

Use the individual plugins for more control over the build

```ts
import {
  advzipPlugin,
  ectPlugin,
  googleClosurePlugin,
  js13kViteBuildOptions,
  roadrollerPlugin,
} from 'js13k-vite-plugins';
import { defineConfig } from 'vite';

export default defineConfig({
  build: js13kViteBuildOptions(),
  plugins: [googleClosurePlugin(), roadrollerPlugin(), ectPlugin(), advzipPlugin()],
});
```

## Exports

```ts
/**
 * Returns the recommended Vite config for a JS13K game.
 *
 * Features:
 * - Uses recommended Vite build options
 * - Uses recommended Terser build options
 * - Adds Google Closure Compiler plugin
 * - Adds Roadroller plugin
 * - Adds ECT plugin
 * - Adds advzip plugin
 *
 * @returns The recommended Vite config for a JS13K game.
 */
export declare function js13kViteConfig(): UserConfigExport;

/**
 * Returns recommended Vite build options for a JS13K game.
 *
 * Features:
 * - Targets ESNext
 * - Minifies with Terser
 * - Disables CSS code splitting
 * - Disables Vite polyfills
 * - Uses recommended Terser options
 * - Uses recommended Rollup options
 *
 * @returns The recommended Vite build options.
 */
export declare function js13kViteBuildOptions(): BuildOptions;

/**
 * Returns recommended Terser options for a JS13K game.
 *
 * Features:
 * - Targets ESNext
 * - Enables all unsafe options
 * - Enables all passes
 * - Enables all mangles
 *
 * @returns The recommended Terser options.
 */
export declare function js13kTerserOptions(): Terser.MinifyOptions;

/**
 * Returns recommended Google Closure Compiler options for a JS13K game.
 *
 * Features:
 * - Targets ESNext
 * - Minifies with Google Closure Compiler
 * - Uses "ADVANCED" compilation level
 * - Adds summary detail level
 *
 * @returns The recommended Google Closure options.
 */
export declare function js13kGoogleClosureOptions(): CompileOptions;

/**
 * Returns recommended Rollup options for a JS13K game.
 *
 * Features:
 * - Enables inline dynamic imports
 *
 * @returns The recommended Rollup options.
 */
export declare function js13kRollupOptions(): RollupOptions;

/**
 * Creates a Google Closure Compiler plugin to minify the JavaScript.
 * @param compilerOptions The options passed to the Google Closure Compiler.
 * @returns The closure compiler plugin.
 */
export declare function googleClosurePlugin(compilerOptions?: ExtendedClosureCompilerOptions): Plugin;

/**
 * Creates the Roadroller plugin that crunches the JS and CSS.
 * @returns The roadroller plugin.
 */
export declare function roadrollerPlugin(): Plugin;

/**
 * Creates the ECT plugin that uses Efficient-Compression-Tool to build a zip file.
 * @returns The ECT plugin.
 */
export declare function ectPlugin(): Plugin;

/**
 * Creates the advzip plugin that uses AdvanceCOMP to optimize the zip file.
 * @returns The advzip plugin.
 */
export declare function advzipPlugin(): Plugin;
```

## License

MIT
