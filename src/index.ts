import advzip from 'advzip-bin';
import { execFileSync } from 'child_process';
import CleanCSS from 'clean-css';
import ect from 'ect-bin';
import fs, { statSync } from 'fs';
import { glob } from 'glob';
import type { CompileOptions } from 'google-closure-compiler';
import googleClosure from 'google-closure-compiler';
import htmlMinify from 'html-minifier-terser';
import path from 'path';
import { Input, InputAction, InputType, Packer } from 'roadroller';
import { OutputAsset, OutputChunk, OutputOptions, RenderedChunk, RollupOptions } from 'rollup';
import { ECMA } from 'terser';
import { BuildOptions, IndexHtmlTransformContext, Plugin, Terser, UserConfigExport } from 'vite';

const { compiler: ClosureCompiler } = googleClosure;

type ExtendedClosureCompilerOptions = CompileOptions & { preserveOutput?: boolean };

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
export function js13kViteConfig(): UserConfigExport {
  return {
    build: js13kViteBuildOptions(),
    plugins: [googleClosurePlugin(), roadrollerPlugin(), ectPlugin(), advzipPlugin()],
  };
}

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
export function js13kViteBuildOptions(): BuildOptions {
  return {
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: false,
    modulePreload: {
      polyfill: false, // Don't add vite polyfills
    },
    terserOptions: js13kTerserOptions(),
    rollupOptions: js13kRollupOptions(),
  };
}

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
export function js13kTerserOptions(): Terser.MinifyOptions {
  return {
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
}

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
export function js13kGoogleClosureOptions(): CompileOptions {
  return {
    language_in: 'ECMASCRIPT_NEXT',
    language_out: 'ECMASCRIPT_NEXT',
    compilation_level: 'ADVANCED', // WHITESPACE_ONLY, SIMPLE, ADVANCED
    strict_mode_input: true,
    jscomp_off: '*',
    summary_detail_level: '3',
  };
}

/**
 * Returns recommended Rollup options for a JS13K game.
 *
 * Features:
 * - Enables inline dynamic imports
 *
 * @returns The recommended Rollup options.
 */
export function js13kRollupOptions(): RollupOptions {
  return {
    output: {
      inlineDynamicImports: true,
      manualChunks: undefined,
    },
  };
}

/**
 * Creates a Google Closure Compiler plugin to minify the JavaScript.
 * @param compilerOptions The options passed to the Google Closure Compiler.
 * @returns The closure compiler plugin.
 */
export function googleClosurePlugin(
  compilerOptions: ExtendedClosureCompilerOptions = js13kGoogleClosureOptions()
): Plugin {
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
            if (!compilerOptions.preserveOutput) {
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

/**
 * Creates the Roadroller plugin that crunches the JS and CSS.
 * @returns The roadroller plugin.
 */
export function roadrollerPlugin(): Plugin {
  return {
    name: 'vite:roadroller',
    transformIndexHtml: {
      enforce: 'post',
      transform: async (html: string, ctx?: IndexHtmlTransformContext): Promise<string> => {
        // Only use this plugin during build
        if (!ctx || !ctx.bundle) {
          return html;
        }

        const options = {
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

        const bundleKeys = Object.keys(ctx.bundle);

        const cssKey = bundleKeys.find((key) => key.endsWith('.css'));
        if (cssKey) {
          html = embedCss(html, ctx.bundle[cssKey] as OutputAsset);
          delete ctx.bundle[cssKey];
        }

        html = await htmlMinify.minify(html, options);

        const jsKey = bundleKeys.find((key) => key.endsWith('.js'));
        if (jsKey) {
          html = await embedJs(html, ctx.bundle[jsKey] as OutputChunk);
          delete ctx.bundle[jsKey];
        }

        return html;
      },
    },
  };
}

/**
 * Transforms the given JavaScript code into a packed version.
 * @param html The original HTML.
 * @param chunk The JavaScript output chunk from Rollup/Vite.
 * @returns The transformed HTML with the JavaScript embedded.
 */
async function embedJs(html: string, chunk: OutputChunk): Promise<string> {
  const scriptTagRemoved = html.replace(new RegExp(`<script[^>]*?${escapeRegExp(chunk.fileName)}[^>]*?></script>`), '');
  const htmlInJs = `document.write('${scriptTagRemoved}');` + chunk.code.trim();
  const inputs: Input[] = [
    {
      data: htmlInJs,
      type: 'js' as InputType,
      action: 'eval' as InputAction,
    },
  ];
  const options = {};
  const packer = new Packer(inputs, options);
  await packer.optimize(2);
  const { firstLine, secondLine } = packer.makeDecoder();
  return `<script>\n${firstLine}\n${secondLine}\n</script>`;
}

/**
 * Embeds CSS into the HTML.
 * @param html The original HTML.
 * @param asset The CSS asset.
 * @returns The transformed HTML with the CSS embedded.
 */
function embedCss(html: string, asset: OutputAsset): string {
  const reCSS = new RegExp(`<link [^>]*?href="[./]*${escapeRegExp(asset.fileName)}"[^>]*?>`);
  const code = `<style>${new CleanCSS({ level: 2 }).minify(asset.source as string).styles}</style>`;
  return html.replace(reCSS, code);
}

/**
 * Creates the ECT plugin that uses Efficient-Compression-Tool to build a zip file.
 * @returns The ECT plugin.
 */
export function ectPlugin(): Plugin {
  return {
    name: 'vite:ect',
    writeBundle: async (): Promise<void> => {
      // List files in dist directory
      // Make sure the .html file is first
      const files = glob.sync('dist/**/*', { nodir: true }).sort((a) => (a.endsWith('.html') ? -1 : 1));
      try {
        const args = ['-strip', '-zip', '-10009', ...files];
        const result = execFileSync(ect, args);
        console.log('ECT result', result.toString().trim());
        const stats = statSync('dist/index.zip');
        console.log('ECT ZIP size', stats.size);
      } catch (err) {
        console.log('ECT error', err);
      }
    },
  };
}

/**
 * Creates the advzip plugin that uses AdvanceCOMP to optimize the zip file.
 * @returns The advzip plugin.
 */
export function advzipPlugin(): Plugin {
  return {
    name: 'vite:advzip',
    writeBundle: async (): Promise<void> => {
      try {
        const args = ['--recompress', '--shrink-extra', 'dist/index.zip'];
        const result = execFileSync(advzip, args);
        console.log(result.toString().trim());
        const stats = statSync('dist/index.zip');
        console.log('advzip ZIP size', stats.size);
      } catch (err) {
        console.log('advzip error', err);
      }
    },
  };
}

function escapeRegExp(str: string): string {
  // https://stackoverflow.com/a/6969486/2051724
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
