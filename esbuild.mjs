/* global console */
/* eslint no-console: "off" */

import { writeFileSync } from 'node:fs';
import esbuild from 'esbuild';

const options = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  loader: { '.ts': 'ts' },
  resolveExtensions: ['.ts'],
  target: 'es2021',
  tsconfig: 'tsconfig.json',
  minify: false,
  sourcemap: true,
  external: [
    '@rollup/plugin-typescript',
    'advzip-bin',
    'clean-css',
    'ect-bin',
    'glob',
    'html-minifier-terser',
    'imagemin',
    'imagemin-*',
    'roadroller',
    'shader-minifier-wasm',
    'terser',
    'rollup',
    'typescript',
    'vite',
    'vite-plugin-imagemin',
  ],
};

esbuild
  .build({
    ...options,
    format: 'cjs',
    outfile: './dist/cjs/index.cjs',
  })
  .then(() => writeFileSync('./dist/cjs/package.json', '{"type": "commonjs"}'))
  .catch(console.error);

esbuild
  .build({
    ...options,
    format: 'esm',
    outfile: './dist/esm/index.mjs',
  })
  .then(() => writeFileSync('./dist/esm/package.json', '{"type": "module"}'))
  .catch(console.error);
