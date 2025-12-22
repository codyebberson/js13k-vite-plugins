declare module 'shader-minifier-wasm' {
  /**
   * @see https://github.com/laurentlb/shader-minifier#usage
   */
  export type Options = {
    /** Set the output filename (default is shader_code.h) */
    outputName?: string;
    /** Verbose, display additional information */
    verbose?: boolean;
    /** Debug, display more additional information */
    debug?: boolean;
    /** Use HLSL (default is GLSL) */
    hlsl?: boolean;
    /** Choose to format the output (use 'text' if you want just the shader) */
    format?: 'text' | 'indented' | 'c-variables' | 'c-array' | 'js' | 'nasm' | 'rust' | 'json';
    /** Choose the field names for vectors: 'rgba', 'xyzw', or 'stpq' */
    fieldNames?: 'rgba' | 'xyzw' | 'stpq';
    /** Do not rename external values (e.g. uniform) */
    preserveExternals?: boolean;
    /** Do not rename functions and global variables */
    preserveAllGlobals?: boolean;
    /** Do not automatically inline variables and functions */
    noInlining?: boolean;
    /** Aggressively inline constants */
    aggressiveInlining?: boolean;
    /** Do not rename anything */
    noRenaming?: boolean;
    /** Comma-separated list of functions to preserve */
    noRenamingList?: string | string[];
    /** Do not use the comma operator trick */
    noSequence?: boolean;
    /** Do not remove unused code */
    noRemoveUnused?: boolean;
    /** When renaming functions, do not introduce new overloads */
    noOverloading?: boolean;
    /** Move declarations to group them */
    moveDeclarations?: boolean;
    /** Evaluate some of the file preprocessor directives */
    preprocess?: boolean;
    /** Export kkpView symbol maps */
    exportKkpSymbolMaps?: boolean;
  };

  export function createMinifier(): Promise<(sources: Record<string, string>, options?: Options) => string>;
  export function minify(sources: Record<string, string>, options?: Options): Promise<string>;
}
