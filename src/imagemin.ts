import fs from 'node:fs';
import path from 'node:path';
import imagemin from 'imagemin';
import imageminGif, { Options as GifsicleOptions } from 'imagemin-gifsicle';
import imageminJpegTran, { Options as JpegtranOptions } from 'imagemin-jpegtran';
import imageminJpeg, { Options as MozjpegOptions } from 'imagemin-mozjpeg';
import imageminOptPng, { Options as OptipngOptions } from 'imagemin-optipng';
import imageminPng, { Options as PngquantOptions } from 'imagemin-pngquant';
import imageminSvgo, { Options as BaseSvgoOptions } from 'imagemin-svgo';
import imageminWebp, { Options as WebpOptions } from 'imagemin-webp';
import type { Plugin, ResolvedConfig } from 'vite';
import { isBoolean, isFunction, isNotFalse, isRegExp, readAllFiles } from '../src/utils';
import { EnabledOptions, addDefaultValues } from './utils';

// Vite plugin for imagemin compression
// Fixes Windows path bugs in original code
// Based on vite-plugin-imagemin
// Source: https://github.com/vbenjs/vite-plugin-imagemin/blob/main/packages/core/src

export interface SvgOption extends BaseSvgoOptions {
  plugins: any[];
}

export interface ImageMinOptions {
  /**
   * Log compressed files and their compression ratios.
   * @default: true
   */
  verbose?: boolean;

  /**
   * Filter files that do not need to be compressed
   */
  filter?: RegExp | ((file: string) => boolean);

  /**
   * Whether to enable compression
   * @default: false
   */
  disable?: boolean;

  /**
   * gif compression configuration
   * @default: {enabled:true}
   */
  gifsicle?: EnabledOptions<GifsicleOptions>;

  /**
   * svg compression configuration
   * @default: {enabled:true}
   */
  svgo?: EnabledOptions<SvgOption>;

  /**
   * jpeg compression configuration
   * @default: {enabled:false}
   */
  mozjpeg?: EnabledOptions<MozjpegOptions>;

  /**
   * png compression configuration
   * @default: {enabled:true}
   */
  optipng?: EnabledOptions<OptipngOptions>;

  /**
   * png compression configuration
   * @default: {enabled:false}
   */
  pngquant?: EnabledOptions<PngquantOptions>;

  /**
   * webp compression configuration
   * @default: {enabled:false}
   */
  webp?: EnabledOptions<WebpOptions>;

  /**
   * jpeg compression configuration
   * @default: {enabled:true}
   */
  jpegTran?: EnabledOptions<JpegtranOptions>;
}

export const defaultImageminOptions: ImageMinOptions = {
  verbose: true,
  gifsicle: {
    optimizationLevel: 7,
    interlaced: false,
  },
  optipng: {
    optimizationLevel: 7,
  },
  mozjpeg: {
    quality: 20,
  },
  pngquant: {
    quality: [0, 1],
    speed: 1,
  },
  svgo: {
    plugins: [
      {
        name: 'removeViewBox',
      },
      {
        name: 'removeEmptyAttrs',
        active: false,
      },
    ],
  },
};

const extRE = /\.(png|jpeg|gif|jpg|bmp|svg)$/i;

export function imageminPlugin(options?: ImageMinOptions): Plugin {
  const imageminOptions = addDefaultValues(options, defaultImageminOptions);
  let outputPath = './dist/';
  let publicDir = './public/';
  let config: ResolvedConfig;

  const { disable = false, filter = extRE, verbose = true } = imageminOptions;

  if (disable) {
    return {} as any;
  }

  const mtimeCache = new Map<string, number>();
  let tinyMap = new Map<string, { size: number; oldSize: number; ratio: number }>();

  async function processFile(filePath: string, buffer: Buffer): Promise<Buffer | undefined> {
    let content: Buffer;

    try {
      content = await imagemin.buffer(buffer, {
        plugins: getImageminPlugins(options),
      });

      const size = content.byteLength;
      const oldSize = buffer.byteLength;

      tinyMap.set(filePath, {
        size: size / 1024,
        oldSize: oldSize / 1024,
        ratio: size / oldSize - 1,
      });

      return content;
    } catch (error) {
      config.logger.error('imagemin error:' + filePath);
      return undefined;
    }
  }

  return {
    name: 'vite:imagemin',
    apply: 'build',
    enforce: 'post',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      outputPath = config.build.outDir;

      // get public static assets directory: https://vitejs.dev/guide/assets.html#the-public-directory
      if (typeof config.publicDir === 'string') {
        publicDir = config.publicDir;
      }
    },
    async generateBundle(_, bundler) {
      tinyMap = new Map();
      const files: string[] = [];
      for (const key of Object.keys(bundler)) {
        if (filterFile(path.resolve(outputPath, key), filter)) {
          files.push(key);
        }
      }
      if (!files.length) {
        return;
      }

      const handles = files.map(async (filePath: string) => {
        const source = (bundler[filePath] as any).source;
        const content = await processFile(filePath, source);
        if (content) {
          (bundler[filePath] as any).source = content;
        }
      });

      await Promise.all(handles);
    },
    async closeBundle() {
      if (publicDir) {
        const files: string[] = [];

        // try to find any static images in original static folder
        for (const file of readAllFiles(publicDir)) {
          if (filterFile(file, filter)) {
            files.push(file);
          }
        }

        if (files.length) {
          const handles = files.map(async (publicFilePath: string) => {
            // now convert the path to the output folder
            publicDir = (path.resolve(publicDir) + path.sep).replaceAll('\\', '/');
            publicFilePath = path.resolve(publicFilePath).replaceAll('\\', '/');
            const filePath = publicFilePath.replace(publicDir, '');
            const fullFilePath = path.resolve(outputPath, filePath).replaceAll('\\', '/');
            if (fs.existsSync(fullFilePath) === false) {
              return;
            }

            const { mtimeMs } = fs.statSync(fullFilePath);
            if (mtimeMs <= (mtimeCache.get(filePath) || 0)) {
              return;
            }

            const buffer = fs.readFileSync(fullFilePath);
            const content = await processFile(filePath, buffer);

            if (content) {
              fs.writeFileSync(fullFilePath, content);
              mtimeCache.set(filePath, Date.now());
            }
          });

          await Promise.all(handles);
        }
      }

      if (verbose) {
        handleOutputLogger(config, tinyMap);
      }
    },
  } as Plugin;
}

// Packed output logic
function handleOutputLogger(
  config: ResolvedConfig,
  recordMap: Map<string, { size: number; oldSize: number; ratio: number }>,
) {
  const keyLengths = Array.from(recordMap.keys(), (name) => name.length);
  const valueLengths = Array.from(recordMap.values(), (value) => `${Math.floor(100 * value.ratio)}`.length);

  const maxKeyLength = Math.max(...keyLengths);
  const valueKeyLength = Math.max(...valueLengths);
  recordMap.forEach((value, name) => {
    let { ratio } = value;
    const { size, oldSize } = value;
    ratio = Math.floor(100 * ratio);
    const fr = `${ratio}`;

    const denseRatio = ratio > 0 ? `+${fr}%` : ratio <= 0 ? `${fr}%` : '';

    const sizeStr = `${oldSize.toFixed(2)}kb / tiny: ${size.toFixed(2)}kb`;

    config.logger.info(
      path.basename(config.build.outDir) +
        '/' +
        name +
        ' '.repeat(2 + maxKeyLength - name.length) +
        `${denseRatio} ${' '.repeat(valueKeyLength - fr.length)}` +
        ' ' +
        sizeStr,
    );
  });
}

function filterFile(file: string, filter: RegExp | ((file: string) => boolean)) {
  if (filter) {
    const isRe = isRegExp(filter);
    const isFn = isFunction(filter);
    if (isRe) {
      return (filter as RegExp).test(file);
    }
    if (isFn) {
      return (filter as (file: any) => any)(file);
    }
  }
  return false;
}

// imagemin compression plugin configuration
function getImageminPlugins(options: ImageMinOptions = {}): imagemin.Plugin[] {
  const {
    gifsicle = true,
    webp = false,
    mozjpeg = false,
    pngquant = false,
    optipng = true,
    svgo = true,
    jpegTran = true,
  } = options;

  const plugins: imagemin.Plugin[] = [];

  if (isNotFalse(gifsicle)) {
    // debug('gifsicle:', true);
    const opt = isBoolean(gifsicle) ? undefined : gifsicle;
    plugins.push(imageminGif(opt));
  }

  if (isNotFalse(mozjpeg)) {
    // debug('mozjpeg:', true);
    const opt = isBoolean(mozjpeg) ? undefined : mozjpeg;
    plugins.push(imageminJpeg(opt));
  }

  if (isNotFalse(pngquant)) {
    // debug('pngquant:', true);
    const opt = isBoolean(pngquant) ? undefined : pngquant;
    plugins.push(imageminPng(opt));
  }

  if (isNotFalse(optipng)) {
    // debug('optipng:', true);
    const opt = isBoolean(optipng) ? undefined : optipng;
    plugins.push(imageminOptPng(opt));
  }

  if (isNotFalse(svgo)) {
    // debug('svgo:', true);
    const opt = isBoolean(svgo) ? undefined : svgo;

    // if (opt !== null && isObject(opt) && Reflect.has(opt, 'plugins')) {
    //   (opt as any).plugins.push({
    //     name: 'preset-default',
    //   });
    // }
    plugins.push(imageminSvgo(opt));
  }

  if (isNotFalse(webp)) {
    // debug('webp:', true);
    const opt = isBoolean(webp) ? undefined : webp;
    plugins.push(imageminWebp(opt));
  }

  if (isNotFalse(jpegTran)) {
    // debug('webp:', true);
    const opt = isBoolean(jpegTran) ? undefined : jpegTran;
    plugins.push(imageminJpegTran(opt));
  }
  return plugins;
}
