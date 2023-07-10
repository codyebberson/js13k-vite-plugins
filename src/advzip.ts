import advzip from 'advzip-bin';
import { execFileSync } from 'child_process';
import { statSync } from 'fs';
import { Plugin } from 'vite';
import { addDefaultValues } from './utils';

export interface AdvzipOptions {
  recompress?: boolean;
  shrinkExtra?: boolean;
}

export const defaultAdvzipOptions: AdvzipOptions = {
  recompress: true,
  shrinkExtra: true,
};

/**
 * Creates the advzip plugin that uses AdvanceCOMP to optimize the zip file.
 * @returns The advzip plugin.
 */
export function advzipPlugin(options?: AdvzipOptions): Plugin {
  const advzipOptions = addDefaultValues(options, defaultAdvzipOptions);
  return {
    name: 'vite:advzip',
    writeBundle: async (): Promise<void> => {
      try {
        const args = [];
        if (advzipOptions.recompress) {
          args.push('--recompress');
        }
        if (advzipOptions.shrinkExtra) {
          args.push('--shrink-extra');
        }
        args.push('dist/index.zip');
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
