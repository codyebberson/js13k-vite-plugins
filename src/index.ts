import { RollupOptions } from 'rollup';
import { ECMA } from 'terser';
import { BuildOptions, Terser, UserConfigExport } from 'vite';
import { AdvzipOptions, advzipPlugin, defaultAdvzipOptions } from './advzip';
import { defaultGoogleClosureOptions, ExtendedClosureCompilerOptions, googleClosurePlugin } from './closure';
import { defaultEctOptions, EctOptions, ectPlugin } from './ect';
import {
  defaultHtmlMinifyOptions,
  defaultRoadrollerOptions,
  HtmlMinifyOptions,
  RoadrollerOptions,
  roadrollerPlugin,
} from './roadroller';
import { addDefaultValues } from './utils';

export type {
  AdvzipOptions,
  EctOptions,
  ExtendedClosureCompilerOptions,
  HtmlMinifyOptions,
  RoadrollerOptions,
  RollupOptions,
};

export {
  advzipPlugin,
  defaultAdvzipOptions,
  defaultEctOptions,
  defaultGoogleClosureOptions,
  defaultHtmlMinifyOptions,
  defaultRoadrollerOptions,
  ectPlugin,
  googleClosurePlugin,
  roadrollerPlugin,
};

export interface JS13KOptions {
  viteOptions?: BuildOptions;
  terserOptions?: Terser.MinifyOptions;
  rollupOptions?: RollupOptions;
  closureOptions?: ExtendedClosureCompilerOptions;
  htmlMinifyOptions?: HtmlMinifyOptions;
  roadrollerOptions?: RoadrollerOptions;
  ectOptions?: EctOptions;
  advzipOptions?: AdvzipOptions;
}

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
  target: 'esnext',
  minify: 'terser',
  cssCodeSplit: false,
  modulePreload: {
    polyfill: false, // Don't add vite polyfills
  },
  terserOptions: defaultTerserOptions,
  rollupOptions: defaultRollupOptions,
};

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
export function js13kViteConfig(options?: JS13KOptions): UserConfigExport {
  return {
    build: addDefaultValues(
      {
        ...options?.viteOptions,
        terserOptions: options?.terserOptions,
        rollupOptions: options?.rollupOptions,
      },
      defaultViteBuildOptions,
    ),
    plugins: [
      googleClosurePlugin(options?.closureOptions),
      roadrollerPlugin(options?.roadrollerOptions, options?.htmlMinifyOptions),
      ectPlugin(options?.ectOptions),
      advzipPlugin(options?.advzipOptions),
    ],
  };
}
