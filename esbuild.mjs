/* global console */
/* eslint no-console: "off" */

import esbuild from 'esbuild';
import { writeFileSync } from 'fs';

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
    '@ampproject/rollup-plugin-closure-compiler',
    '@rollup/plugin-typescript',
    'advzip-bin',
    'clean-css',
    'ect-bin',
    'glob',
    'google-closure-compiler',
    'html-minifier-terser',
    'roadroller',
    'terser',
    'rollup',
    'ts-node',
    'tslib',
    'typescript',
    'vite',
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
