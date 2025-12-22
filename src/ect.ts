import { execFile } from 'node:child_process';
import { statSync } from 'node:fs';
import { promisify } from 'node:util';
import ect from 'ect-bin';
import { glob } from 'glob';
import type { Plugin, ResolvedConfig } from 'vite';
import { addDefaultValues, printJs13kStats } from './utils';

const execFileAsync: typeof execFile.__promisify__ = promisify(execFile);

/**
 * Efficient Compression Tool (ECT) options.
 *
 * Source: https://github.com/fhanau/Efficient-Compression-Tool
 *
 * Documentation: https://github.com/fhanau/Efficient-Compression-Tool/blob/master/doc/Manual.docx
 *
 * Viewable in Google Docs: https://docs.google.com/document/d/10vbsA4BqKdkGFH9_E1bQVhyX7EWbHKcW/edit?usp=sharing&ouid=108398230704423301333&rtpof=true&sd=true
 */
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

/**
 * Creates the ECT plugin that uses Efficient-Compression-Tool to build a zip file.
 * @returns The ECT plugin.
 */
export function ectPlugin(options?: EctOptions): Plugin {
  const ectOptions = addDefaultValues(options, defaultEctOptions);
  let outDir = 'dist'; // fallback default

  return {
    name: 'js13k:ect',
    apply: 'build',
    enforce: 'post',

    configResolved(config: ResolvedConfig): void {
      outDir = config.build.outDir;
    },

    closeBundle: async (): Promise<void> => {
      // List files in output directory
      // Make sure the .html file is first
      const files = glob.sync(`${outDir}/**/*`, { nodir: true }).sort((a) => (a.endsWith('.html') ? -1 : 1));

      try {
        const args: string[] = [];
        if (ectOptions.quiet) {
          args.push('-quiet');
        }
        if (ectOptions.level !== undefined) {
          args.push(`-${ectOptions.level}`);
        }
        if (ectOptions.strip) {
          args.push('-strip');
        }
        if (ectOptions.keep) {
          args.push('-keep');
        }
        if (ectOptions.strict) {
          args.push('-strict');
        }
        args.push('-zip');
        args.push(...files);

        const { stdout } = await execFileAsync(ect, args);
        console.log('ECT result:', stdout.trim());

        const zipPath = `${outDir}/index.zip`;
        const stats = statSync(zipPath);
        printJs13kStats('ECT ZIP', stats.size);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('ECT compression failed:', errorMessage);
        throw new Error(`ECT compression failed: ${errorMessage}`);
      }
    },
  };
}
