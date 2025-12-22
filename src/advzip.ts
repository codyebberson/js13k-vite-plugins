import { execFile } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { promisify } from 'node:util';
import advzip from 'advzip-bin';
import type { Plugin, ResolvedConfig } from 'vite';
import { addDefaultValues, printJs13kStats } from './utils';

const execFileAsync: typeof execFile.__promisify__ = promisify(execFile);

export interface AdvzipOptions {
  pedantic?: boolean;
  shrinkLevel?: 0 | 1 | 2 | 3 | 4 | 'store' | 'fast' | 'normal' | 'extra' | 'insane';
}

export const defaultAdvzipOptions: AdvzipOptions = {
  shrinkLevel: 'insane',
};

/**
 * Creates the advzip plugin that uses AdvanceCOMP to optimize the zip file.
 * @returns The advzip plugin.
 */
export function advzipPlugin(options?: AdvzipOptions): Plugin {
  const advzipOptions = addDefaultValues(options, defaultAdvzipOptions);
  let outDir = 'dist'; // fallback default

  return {
    name: 'js13k:advzip',
    apply: 'build',
    enforce: 'post',

    configResolved(config: ResolvedConfig): void {
      outDir = config.build.outDir;
    },

    closeBundle: {
      order: 'post', // Run after other closeBundle hooks (including ECT)
      sequential: true,
      async handler(): Promise<void> {
        const zipPath = `${outDir}/index.zip`;

        // Verify ECT ran first and created the zip file
        if (!existsSync(zipPath)) {
          throw new Error('advzip requires ECT plugin to run first - no index.zip found');
        }

        try {
          const args: string[] = ['--recompress'];
          if (advzipOptions.pedantic) {
            args.push('--pedantic');
          }
          if (advzipOptions.shrinkLevel !== undefined) {
            if (typeof advzipOptions.shrinkLevel === 'number') {
              args.push(`-${advzipOptions.shrinkLevel}`);
            } else {
              args.push(`--shrink-${advzipOptions.shrinkLevel}`);
            }
          }
          args.push(zipPath);

          const { stdout } = await execFileAsync(advzip, args);
          console.log(stdout.trim());

          const stats = statSync(zipPath);
          printJs13kStats('advzip ZIP', stats.size);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('advzip compression failed:', errorMessage);
          throw new Error(`advzip compression failed: ${errorMessage}`);
        }
      },
    },
  };
}
