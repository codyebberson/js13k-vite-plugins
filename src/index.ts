import { RollupOptions } from 'rollup';
import { ECMA } from 'terser';
import { BuildOptions, Terser, UserConfigExport } from 'vite';
import { AdvzipOptions, advzipPlugin, defaultAdvzipOptions } from './advzip';
import { EctOptions, defaultEctOptions, ectPlugin } from './ect';
import { ImageMinOptions, imageminPlugin } from './imagemin';
import {
  HtmlMinifyOptions,
  RoadrollerOptions,
  defaultHtmlMinifyOptions,
  defaultRoadrollerOptions,
  roadrollerPlugin,
} from './roadroller';
import { EnabledOptions, addDefaultValues } from './utils';

export type { AdvzipOptions, EctOptions, HtmlMinifyOptions, RoadrollerOptions, RollupOptions };

export {
  advzipPlugin,
  defaultAdvzipOptions,
  defaultEctOptions,
  defaultHtmlMinifyOptions,
  defaultRoadrollerOptions,
  ectPlugin,
  roadrollerPlugin,
};

export interface JS13KOptions {
  viteOptions?: BuildOptions;
  terserOptions?: Terser.MinifyOptions;
  rollupOptions?: RollupOptions;
  htmlMinifyOptions?: HtmlMinifyOptions;
  roadrollerOptions?: EnabledOptions<RoadrollerOptions>;
  imageMinOptions?: EnabledOptions<ImageMinOptions>;
  ectOptions?: EctOptions;
  advzipOptions?: EnabledOptions<AdvzipOptions>;
}

/**
 * Returns recommended Terser options for a JS13K game.
 *
 * Based on Salvatore Previti's recommended configuration:
 * See: https://gist.github.com/SalvatorePreviti/d184cea670eb0ae1d99ef2eb34b17f3e
 *
 * Features:
 * - Targets ESNext
 * - Enables all unsafe options
 * - Enables all passes
 * - Enables all mangles
 */
export const defaultTerserOptions: Terser.MinifyOptions = {
  // Use when minifying an ES6 module.
  // "use strict" is implied and names can be mangled on the top scope.
  // If compress or mangle is enabled then the toplevel option will be enabled.
  // module,
  module: true,

  // set to true if you wish to enable top level variable and function name mangling
  // and to drop unused variables and functions.
  // toplevel: module,
  toplevel: true,

  // Sourcemap support
  sourceMap: false,

  // nameCache: null,

  ecma: 2022 as ECMA,
  ie8: false,
  safari10: false,
  keep_classnames: false,
  keep_fnames: false,

  // Parser options
  parse: {
    bare_returns: false,
    ecma: 2022 as ECMA,
    html5_comments: false,
    shebang: true,
  },

  // Compress options
  compress: {
    ecma: 2022 as ECMA,

    defaults: true,

    ie8: false,

    // Global definitions for conditional compilation
    // global_defs,

    // Inline single-use functions when possible. Depends on reduce_vars being enabled.
    // Disabling this option sometimes improves performance of the output code.
    reduce_funcs: true,

    // Class and object literal methods are converted will also be converted to arrow expressions
    // if the resultant code is shorter: m(){return x} becomes m:()=>x
    arrows: true,

    // replace arguments[index] with function parameter name whenever possible.
    arguments: true,

    // various optimizations for boolean context, for example !!a ? b : c → a ? b : c
    booleans: true,

    // Turn booleans into 0 and 1, also makes comparisons with booleans use == and != instead of === and !==
    // This must be false for terser, or it breaks booleans!
    booleans_as_integers: false,

    // Collapse single-use non-constant variables, side effects permitting.
    collapse_vars: true,

    // apply certain optimizations to binary nodes,
    //  e.g. !(a <= b) → a > b (only when unsafe_comps), attempts to negate binary nodes,
    //  e.g. a = !b && !c && !d && !e → a=!(b||c||d||e) etc.
    comparisons: true,

    // apply optimizations for if-s and conditional expressions
    conditionals: true,

    // remove unreachable code
    dead_code: true,

    // remove redundant or non-standard directives
    directives: true,

    // discard calls to console.* functions.
    // If you wish to drop a specific function call such as console.info
    drop_console: false,

    // remove debugger; statements
    drop_debugger: false,

    // attempt to evaluate constant expressions.
    evaluate: true,

    // Pass true to preserve completion values from terminal statements without return, e.g. in bookmarklets.
    expression: false,

    // hoist function declarations
    hoist_funs: true,

    // hoist properties from constant object and array literals into regular variables subject to a set of constraints.
    // For example: var o={p:1, q:2}; f(o.p, o.q); is converted to f(1, 2)
    hoist_props: true,

    // hoist var declarations
    // (this is false by default because it seems to increase the size of the output in general)
    hoist_vars: false,

    // optimizations for if/return and if/continue
    if_return: true,

    // inline calls to function with simple/return statement
    inline: true,

    // join consecutive var statements
    // join_vars: settings.join_vars,
    join_vars: true,

    // Pass true to prevent the compressor from discarding class names.
    // Pass a regular expression to only keep class names matching that regex.
    keep_classnames: false,

    // Prevents the compressor from discarding unused function arguments.
    // You need this for code which relies on Function.length
    keep_fargs: false,

    // Pass true to prevent the compressor from discarding function names.
    // Pass a regular expression to only keep function names matching that regex
    keep_fnames: false,

    // Pass true to prevent Infinity from being compressed into 1/0,
    // which may cause performance issues on Chrome.
    keep_infinity: false,

    // optimizations for do, while and for loops when we can statically determine the condition.
    loops: true,

    // Pass true when compressing an ES6 module. Strict mode is implied and the toplevel option as well.
    module: true,

    // negate "Immediately-Called Function Expressions" where the return value is discarded,
    // to avoid the parens that the code generator would insert.
    negate_iife: true,

    // The maximum number of times to run compress.
    // In some cases more than one pass leads to further compressed code.
    passes: 5,

    // Rewrite property access using the dot notation, for example foo["bar"] → foo.bar
    // properties: !!settings.computed_props,
    properties: true,

    // Transforms constant computed properties into regular ones:
    // {["computed"]: 1} is converted to {computed: 1}
    // computed_props: settings.computed_props,
    computed_props: true,

    // You can pass an array of names and Terser will assume that those functions do not produce side effects. DANGER: will not check if the name is redefined in scope.
    // pure_funcs: browserPureFunctions,

    // If you pass true for this, Terser will assume that object property access
    // (e.g. foo.bar or foo["bar"]) doesn't have any side effects. Specify "strict"
    // to treat foo.bar as side-effect-free only when foo is certain to not throw,
    // i.e. not null or undefined.
    pure_getters: true,

    // Improve optimization on variables assigned with and used as constant values.
    reduce_vars: true,

    // join consecutive simple statements using the comma operator. If set as positive integer
    // specifies the maximum number of consecutive comma sequences that will be generated.
    // If this option is set to true then the default sequences limit is 200
    // sequences: settings.sequences ? 1000000 : false,
    sequences: 1000000,

    // Remove expressions which have no side effects and whose results aren't used.
    side_effects: true,

    // de-duplicate and remove unreachable switch branches
    switches: true,

    // drop unreferenced functions ("funcs") and/or variables ("vars") in the top level scope.
    // Set to true to drop both unreferenced functions and variables)
    // toplevel: module,
    toplevel: true,

    // prevent specific toplevel functions and variables from unused removal. Implies toplevel.
    top_retain: null,

    // Transforms typeof foo == "undefined" into foo === void 0
    typeofs: true,

    // apply "unsafe" transformations. It enables some transformations that might break code
    // logic in certain contrived cases, but should be fine for most code.
    // It assumes that standard built-in ECMAScript functions and classes have not been
    // altered or replaced.
    unsafe: true,

    // Convert ES5 style anonymous function expressions to arrow functions if the function
    // body does not reference this. Note: it is not always safe to perform this conversion
    // if code relies on the the function having a prototype, which arrow functions lack.
    unsafe_arrows: true,

    // Reverse < and <= to > and >= to allow improved compression.
    // This might be unsafe when an at least one of two operands is an object with
    // computed values due the use of methods like get, or valueOf.
    // This could cause change in execution order after operands in the comparison are switching.
    unsafe_comps: true,

    // compress and mangle Function(args, code) when both args and code are string literals.
    unsafe_Function: true,

    // optimize numerical expressions like 2 * x * 3 into 6 * x, which may give imprecise floating point results.
    unsafe_math: true,

    // removes keys from native Symbol declarations, e.g Symbol("kDog") becomes Symbol().
    unsafe_symbols: true,

    // Converts { m: function(){} } to { m(){} }.
    // If unsafe_methods is a RegExp then key/value pairs with keys matching the
    // RegExp will be converted to concise methods.
    // Note: if enabled there is a risk of getting a "<method name> is not a constructor"
    // TypeError should any code try to new the former function.
    unsafe_methods: true,

    // optimize expressions like Array.prototype.slice.call(a) into [].slice.call(a)
    unsafe_proto: true,

    // enable substitutions of variables with RegExp values the same way as if they are constants.
    unsafe_regexp: true,

    // substitute void 0 if there is a variable named undefined in scope
    // (variable name will be mangled, typically reduced to a single character)
    unsafe_undefined: true,

    // drop unreferenced functions and variables (simple direct variable assignments
    // do not count as references unless set to "keep_assign")
    unused: true,
  },

  // Mangle options
  mangle: {
    safari10: false,

    // Pass true to mangle names visible in scopes where eval or with are used.
    eval: true,

    // Pass true to not mangle class names.
    // Pass a regular expression to only keep class names matching that regex.
    // See also: the keep_classnames compress option.
    keep_classnames: false,

    // Pass true to not mangle function names.
    // Pass a regular expression to only keep class names matching that regex.
    // Useful for code relying on Function.prototype.name.
    // See also: the keep_fnames compress option.
    keep_fnames: false,

    // Pass true an ES6 modules, where the toplevel scope is not the global scope. Implies toplevel.
    module: true,

    // Pass an array of identifiers that should be excluded from mangling. Example: ["foo", "bar"].
    // reserved: [...mangleConfig.reserved],

    // Mangle properties - optimizes a lot but is very dangerous. Enables only with properties starting with $
    properties: {
      // Use true to allow the mangling of builtin DOM properties. Not recommended to override this setting.
      builtins: false,

      // Mangle names with the original name still present. Pass an empty string "" to enable, or a non-empty string to set the debug suffix.
      debug: false,

      // Only mangle unquoted property names.
      //  true: Quoted property names are automatically reserved and any unquoted property names will not be mangled.
      //  'strict': Advanced, all unquoted property names are mangled unless explicitly reserved.
      keep_quoted: true,

      // Pass a RegExp literal or pattern string to only mangle property matching the regular expression.
      // regex: /^[$_]/,
    },

    // Pass true to mangle names declared in the top level scope.
    // toplevel: module,
    toplevel: true,
  },

  // Output options
  format: {
    ie8: false,

    // set desired EcmaScript standard version for output.
    ecma: 2022 as ECMA,

    /** Emit shorthand properties {a} instead of {a: a} */
    shorthand: true,

    // escape Unicode characters in strings and regexps
    // (affects directives with non-ascii characters becoming invalid)
    ascii_only: false,

    // whether to actually beautify the output
    // beautify: !settings.final,
    beautify: false,

    // always insert braces in if, for, do, while or with statements, even if their body is a single statement.
    braces: false,

    // false to omit comments in the output
    // comments: settings.final ? false : 'all',
    comments: false,

    // escape HTML comments and the slash in occurrences of </script> in strings
    inline_script: true,

    // when turned on, prevents stripping quotes from property names in object literals.
    // keep_quoted_props: !settings.computed_props,
    keep_quoted_props: false,

    // maximum line length (for minified code)
    max_line_len: false,

    // when passed it must be a string and it will be prepended to the output literally.
    // The source map will adjust for this text.
    // Can be used to insert a comment containing licensing information, for example.
    preamble: undefined,

    // pass true to quote all keys in literal objects
    quote_keys: false,

    // preferred quote style for strings (affects quoted property names and directives as well):
    //  0 -- prefers double quotes, switches to single quotes when there are more double quotes in the string itself. 0 is best for gzip size.
    //  1 -- always use single quotes
    //  2 -- always use double quotes
    //  3 -- always use the original quotes
    quote_style: 0,

    // Preserve Terser annotations in the output.
    // preserve_annotations: !settings.final,
    preserve_annotations: false,

    // set this option to true to work around the Safari 10/11 await bug.
    safari10: false,

    // separate statements with semicolons.
    // If you pass false then whenever possible we will use a newline instead of a semicolon.
    semicolons: true,

    // preserve shebang #! in preamble (bash scripts)
    shebang: false,

    // enable workarounds for WebKit bugs. PhantomJS users should set this option to true.
    webkit: false,

    // pass true to wrap immediately invoked function expressions.
    wrap_iife: false,

    // pass false if you do not want to wrap function expressions that are passed as arguments, in parenthesis.
    // Passing to true, optimize for faster initial execution and parsing,
    // by wrapping all immediately-invoked functions or likely-to-be-invoked functions in parentheses.
    wrap_func_args: false,
  },
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
  assetsDir: '',
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
 * - Adds imagemin plugin
 * - Adds Roadroller plugin
 * - Adds ECT plugin
 * - Adds advzip plugin
 *
 * @returns The recommended Vite config for a JS13K game.
 */
export function js13kViteConfig(options?: JS13KOptions): UserConfigExport {
  const plugins = [];

  if (options?.imageMinOptions !== false) {
    plugins.push(imageminPlugin(options?.imageMinOptions));
  }

  if (options?.roadrollerOptions !== false) {
    plugins.push(roadrollerPlugin(options?.roadrollerOptions, options?.htmlMinifyOptions));
  }

  plugins.push(ectPlugin(options?.ectOptions));

  if (options?.advzipOptions !== false) {
    plugins.push(advzipPlugin(options?.advzipOptions));
  }

  return {
    build: addDefaultValues(
      {
        ...options?.viteOptions,
        terserOptions: options?.terserOptions,
        rollupOptions: options?.rollupOptions,
      },
      defaultViteBuildOptions,
    ),
    plugins,
  };
}
