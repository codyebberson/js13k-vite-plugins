# js13k-vite-plugins

Collection of [Vite](https://vitejs.dev/) plugins and utilities for [js13k games](https://js13kgames.com/).

Included tools:

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) dev server
- [Rollup](https://rollupjs.org/guide/en/) production build
- [Imagemin](https://github.com/imagemin/imagemin) - image compression
- [Roadroller](https://lifthrasiir.github.io/roadroller/) - best JS compressor
- [Efficient Compression Tool](https://github.com/fhanau/Efficient-Compression-Tool) - best ZIP
- [Advzip](https://github.com/amadvance/advancecomp) - post-processing ZIP compression

Example project: <https://github.com/codyebberson/js13k-starter>

## Table of Contents

- [Getting Started](#getting-started)
- [Example Configurations](#ground-rules)
  - [Use All Recommendations](#use-all-recommendations)
  - [Disalbe Plugins](#disable-plugins)
  - [Override Specific Settings](#override-specific-settings)
  - [Use Plugins Individually](#use-plugins-individually)
- [Options](#options)
  - [Vite Options](#vite-options)
  - [Terser Options](#terser-options)
  - [Rollup Options](#rollup-options)
  - [HTML Minify Options](#html-minify-options)
  - [Imagemin Options](#imagemin-options)
  - [Roadroller Options](#roadroller-options)
  - [ECT Options](#ect-options)
  - [Advzip Options](#advzip-options)
- [Acknowledgements](#acknowledgements)

## Getting Started

### From Template

Go to the [js13k-starter](https://github.com/codyebberson/js13k-starter) repository and click "Use this template" to create a new repository with the same files and folders as the template.

Clone the new repository and install the dependencies:

```bash
git clone git@github.com:your-username/js13k-starter.git
cd js13k-starter
npm install
```

Then run the development server:

```bash
npm run dev
```

### From Scratch

First, setup a new Vite project: <https://vitejs.dev/guide/#scaffolding-your-first-vite-project>

```bash
npm create vite@latest
```

Next, add `js13k-vite-plugins`:

```bash
npm install --save-dev js13k-vite-plugins
```

Then update your Vite configuration as needed. See below for example Vite configurations.

## Example Configurations

Example `vite.config.ts` files

### Use All Recommendations

Use `js13kViteConfig()` for a quick and easy default configuration (recommended).

```ts
// vite.config.ts

import { js13kViteConfig } from "js13k-vite-plugins";
import { defineConfig } from "vite";

export default defineConfig(js13kViteConfig());
```

### Disable Plugins

Some plugins can be disabled individually by passing `false` for the options.

- Disable Roadroller by passing `roadrollerOptions: false`
- Disable Advzip by passing `advzipOptions: false`

For example, disable Roadroller:

```ts
// vite.config.ts

import { js13kViteConfig } from "js13k-vite-plugins";
import { defineConfig } from "vite";

export default defineConfig(
  js13kViteConfig({
    roadrollerOptions: false,
  })
);
```

### Override Specific Settings

Pass in options to configure specific plugins.

For example, change the Advzip shrink level to "fast" (from default "insane").

```ts
// vite.config.ts

import { js13kViteConfig } from "js13k-vite-plugins";
import { defineConfig } from "vite";

export default defineConfig(
  js13kViteConfig({
    advzipOptions: {
      shrinkLevel: "fast",
    },
  })
);
```

### Use Plugins Individually

Use the individual plugins for more control over the build.

```ts
// vite.config.ts

import {
  advzipPlugin,
  ectPlugin,
  getDefaultViteBuildOptions,
  roadrollerPlugin,
} from "js13k-vite-plugins";
import { defineConfig } from "vite";

export default defineConfig({
  build: getDefaultViteBuildOptions(),
  plugins: [roadrollerPlugin(), ectPlugin(), advzipPlugin()],
});
```

## Options

The top level options is a collection of options for the various sub-plugins.

```ts
export interface JS13KOptions {
  viteOptions?: BuildOptions;
  terserOptions?: Terser.MinifyOptions;
  rollupOptions?: RollupOptions;
  htmlMinifyOptions?: HtmlMinifyOptions;
  roadrollerOptions?: RoadrollerOptions;
  ectOptions?: EctOptions;
  advzipOptions?: AdvzipOptions;
}
```

### Vite Options

Base package: [`vite`](https://www.npmjs.com/package/vite)

Full Vite documentation: <https://vitejs.dev/config/build-options.html>

Default options:

```ts
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
export const defaultViteBuildOptions: BuildOptions = {
  target: "esnext",
  minify: "terser",
  cssCodeSplit: false,
  modulePreload: {
    polyfill: false, // Don't add vite polyfills
  },
  terserOptions: defaultTerserOptions,
  rollupOptions: defaultRollupOptions,
};
```

### Terser Options

Base package: [`terser`](https://www.npmjs.com/package/terser)

Full Terser documentation: <https://terser.org/docs/options/>

Default options:

```ts
/**
 * Returns recommended Terser options for a JS13K game.
 *
 * Features:
 * - Targets ESNext
 * - Enables all unsafe options
 * - Enables all passes
 * - Enables all mangles
 */
export const defaultTerserOptions: Terser.MinifyOptions = {
  compress: {
    ecma: 2020 as ECMA,
    module: true,
    passes: 3,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_methods: true,
    unsafe_proto: true,
  },
  mangle: {
    module: true,
    toplevel: true,
  },
  format: {
    comments: false,
    ecma: 2020 as ECMA,
  },
  module: true,
  toplevel: true,
};
```

### Rollup Options

Base package: [`rollup`](https://www.npmjs.com/package/rollup)

Full Rollup documentation: <https://rollupjs.org/configuration-options/>

Default options:

```ts
/**
 * Returns recommended Rollup options for a JS13K game.
 *
 * Features:
 * - Enables inline dynamic imports
 *
 * @returns The recommended Rollup options.
 */
export const defaultRollupOptions: RollupOptions = {
  output: {
    inlineDynamicImports: true,
    manualChunks: undefined,
  },
};
```

### HTML Minify Options

Base package: [`html-minifier-terser`](https://www.npmjs.com/package/html-minifier-terser)

Full HTML Minify documentation: https://github.com/terser/html-minifier-terser

Default options:

```ts
export const defaultHtmlMinifyOptions: HtmlMinifyOptions = {
  includeAutoGeneratedTags: true,
  removeAttributeQuotes: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
  collapseWhitespace: true,
  collapseInlineTagWhitespace: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  sortAttributes: true,
};
```

### Imagemin Options

Base package: [`imagemin`](https://www.npmjs.com/package/imagemin)

| params   | type                                  | default | default                                                      |
| -------- | ------------------------------------- | ------- | ------------------------------------------------------------ |
| verbose  | `boolean`                             | `true`  | Whether to output the compressed result in the console       |
| filter   | `RegExp or (file: string) => boolean` | -       | Specify which resources are not compressed                   |
| disable  | `boolean`                             | `false` | Whether to disable                                           |
| svgo     | `object` or `false`                   | -       | See [Options](https://github.com/svg/svgo/#what-it-can-do)   |
| gifsicle | `object` or `false`                   | -       | See [Options](https://github.com/imagemin/imagemin-gifsicle) |
| mozjpeg  | `object` or `false`                   | -       | See [Options](https://github.com/imagemin/imagemin-mozjpeg)  |
| optipng  | `object` or `false`                   | -       | See [Options](https://github.com/imagemin/imagemin-optipng)  |
| pngquant | `object` or `false`                   | -       | See [Options](https://github.com/imagemin/imagemin-pngquant) |
| webp     | `object` or `false`                   | -       | See [Options](https://github.com/imagemin/imagemin-webp)     |

### Roadroller Options

Base package: [`roadroller`](https://www.npmjs.com/package/roadroller)

Full Roadroller documentation: <https://lifthrasiir.github.io/roadroller/>

This plugin uses the Roadroller defaults.

### ECT Options

Base package: [`ect-bin`](https://www.npmjs.com/package/ect-bin)

ECT documentation: <https://github.com/fhanau/Efficient-Compression-Tool/blob/master/doc/Manual.docx> ([Google Docs](https://docs.google.com/document/d/10vbsA4BqKdkGFH9_E1bQVhyX7EWbHKcW/edit?usp=sharing&ouid=108398230704423301333&rtpof=true&sd=true))

```ts
export interface EctOptions {
  /**
   * Show no report when program is finished; print only warnings and errors.
   */
  quiet?: boolean;

  /**
   * Select compression level [1-9] (ECT default: 3, JS13k default: 10009).
   *
   * For detailed information on performance read Performance.html.
   *
   * Advanced usage:
   * A different syntax may be used to achieve even more compression for deflate compression
   * if time (and efficiency) is not a concern.
   * If the value is above 10000, the blocksplitting-compression cycle is repeated # / 10000 times.
   * If # % 10000 is above 9, level 9 is used and the number of iterations of deflate compression
   * per block is set to # % 10000. If # % 10000 is 9 or below, this number specifies the level.
   */
  level?: number;

  /**
   * Discard metadata. (default true).
   */
  strip?: boolean;

  /**
   * Keep the file modification time. (default false).
   */
  keep?: boolean;

  /**
   * Enable strict losslessness. Without this, image data under fully transparent pixels can be
   * modified to increase compression. This data is normally invisible and not needed.
   * However, you may want to use this option if you are still going to edit the image.
   *
   * Also preserves rarely used GZIP metadata.
   *
   * (default false).
   */
  strict?: boolean;
}
```

Default options:

```ts
/**
 * Default Efficient Compression Tool (ECT) options.
 *
 * Level 10009 is the recommended value for JS13k games. This will be slow but will produce the smallest file size.
 *
 * Strip is true by default because metadata is not needed for JS13k games.
 */
export const defaultEctOptions: EctOptions = {
  level: 10009,
  strip: true,
};
```

### Advzip Options

Base package: [`advzip-bin`](https://www.npmjs.com/package/advzip-bin)

Full Advzip documentation: <https://linux.die.net/man/1/advzip>

TypeScript interface:

```ts
export interface AdvzipOptions {
  pedantic?: boolean;
  shrinkLevel?:
    | 0
    | 1
    | 2
    | 3
    | 4
    | "store"
    | "fast"
    | "normal"
    | "extra"
    | "insane";
}
```

Default options:

```ts
export const defaultAdvzipOptions: AdvzipOptions = {
  shrinkLevel: "insane",
};
```

## Acknowledgements

[Kang Seonghoon](https://mearie.org/) for [Roadroller](https://lifthrasiir.github.io/roadroller/)

[Rob Louie](https://github.com/roblouie) for Roadroller configuration recommendations

[Salvatore Previti](https://github.com/SalvatorePreviti) for Terser configuration recommendations

## License

MIT
