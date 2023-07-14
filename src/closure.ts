import fs from 'fs';
import googleClosure from 'google-closure-compiler';
import path from 'path';
import { OutputOptions, RenderedChunk } from 'rollup';
import { Plugin } from 'vite';
import { addDefaultValues } from './utils';

const { compiler: ClosureCompiler } = googleClosure;

export type CompileOption = string | boolean;
export type CompileOptions = { [key: string]: CompileOption | CompileOption[] };
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
export function googleClosurePlugin(compilerOptions?: ExtendedClosureCompilerOptions): Plugin {
  return {
    name: 'closure-compiler',
    renderChunk: (code: string, chunk: RenderedChunk, options: OutputOptions) => {
      // https://rollupjs.org/guide/en/#renderchunk
      if (!chunk.fileName.endsWith('.js')) {
        // Returning null will apply no transformations.
        return null;
      }
      return googleClosureImpl(code, options, compilerOptions);
    },
  };
}

async function googleClosureImpl(
  code: string,
  options: OutputOptions,
  googleClosureOptions?: ExtendedClosureCompilerOptions,
): Promise<{ code: string }> {
  const { preserveOutput, ...compilerOptions } = addDefaultValues(googleClosureOptions, defaultGoogleClosureOptions);

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

  const nativePath = await getNativeImagePath();
  if (nativePath) {
    (closureCompiler as any).JAR_PATH = null;
    closureCompiler.javaPath = nativePath;
  }

  return new Promise((resolve, reject) => {
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
}

//
// Closure Compiler Platform
// Utility methods for determining the platform to use.
// These can be found in node_modules/google-closure-compiler/lib/utils.js
// Unfortunately, they are not exported, so we have to copy them here.
//

async function tryGetNativeImagePath(packageName: string): Promise<string | undefined> {
  try {
    // @ts-ignore
    return (await import(packageName))?.default;
  } catch (e) {}
  return undefined;
}

async function getNativeImagePath(): Promise<string | undefined> {
  if (process.platform === 'darwin') {
    return tryGetNativeImagePath('google-closure-compiler-osx');
  }
  if (process.platform === 'win32') {
    return tryGetNativeImagePath('google-closure-compiler-windows');
  }
  if (process.platform === 'linux' && ['x64', 'x32'].includes(process.arch)) {
    return tryGetNativeImagePath('google-closure-compiler-linux');
  }
  return undefined;
}
