import fs from 'fs';
import type { CompileOptions } from 'google-closure-compiler';
import googleClosure from 'google-closure-compiler';
import path from 'path';
import { OutputOptions, RenderedChunk } from 'rollup';
import { Plugin } from 'vite';
import { addDefaultValues } from './utils';

const { compiler: ClosureCompiler } = googleClosure;

export type ExtendedClosureCompilerOptions = CompileOptions & { preserveOutput?: boolean };

/**
 * Returns recommended Google Closure Compiler options for a JS13K game.
 *
 * Features:
 * - Targets ESNext
 * - Minifies with Google Closure Compiler
 * - Uses "ADVANCED" compilation level
 * - Adds summary detail level
 */
export const defaultGoogleClosureOptions: ExtendedClosureCompilerOptions = {
  language_in: 'ECMASCRIPT_NEXT',
  language_out: 'ECMASCRIPT_NEXT',
  compilation_level: 'ADVANCED', // WHITESPACE_ONLY, SIMPLE, ADVANCED
  strict_mode_input: true,
  jscomp_off: '*',
  summary_detail_level: '3',
};

/**
 * Creates a Google Closure Compiler plugin to minify the JavaScript.
 * @param compilerOptions The options passed to the Google Closure Compiler.
 * @returns The closure compiler plugin.
 */
export function googleClosurePlugin(options?: ExtendedClosureCompilerOptions): Plugin {
  const { preserveOutput, ...compilerOptions } = addDefaultValues(options, defaultGoogleClosureOptions);
  return {
    name: 'closure-compiler',
    renderChunk: (code: string, chunk: RenderedChunk, options: OutputOptions) => {
      // https://rollupjs.org/guide/en/#renderchunk
      if (!chunk.fileName.endsWith('.js')) {
        // Returning null will apply no transformations.
        return null;
      }
      return new Promise((resolve, reject) => {
        const dir = path.resolve(options.dir as string);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const timestamp = Date.now();
        const inputFileName = path.resolve(dir, `closure-input-${timestamp}.js`);
        const outputFileName = path.resolve(dir, `closure-output-${timestamp}.js`);
        fs.writeFileSync(inputFileName, code);

        const closureCompiler = new ClosureCompiler({
          ...compilerOptions,
          js: inputFileName,
          js_output_file: outputFileName,
        });

        closureCompiler.run((exitCode, _stdOut, stdErr) => {
          if (exitCode === 0) {
            const result = { code: fs.readFileSync(outputFileName, 'utf8') };
            if (!preserveOutput) {
              fs.unlinkSync(inputFileName);
              fs.unlinkSync(outputFileName);
            }
            resolve(result);
          } else {
            reject(stdErr);
          }
        });
      });
    },
  };
}
