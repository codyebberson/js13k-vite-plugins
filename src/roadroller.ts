import CleanCSS from 'clean-css';
import htmlMinify, { Options as HtmlMinifyOptions } from 'html-minifier-terser';
import { Input, InputAction, InputType, Packer, PackerOptions } from 'roadroller';
import { OutputAsset, OutputChunk } from 'rollup';
import { IndexHtmlTransformContext, Plugin } from 'vite';
import { addDefaultValues, escapeRegExp } from './utils';

export type RoadrollerOptions = PackerOptions;

export const defaultRoadrollerOptions: RoadrollerOptions = {};

export type { HtmlMinifyOptions };

export const defaultHtmlMinifyOptions: HtmlMinifyOptions = {
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

/**
 * Creates the Roadroller plugin that crunches the JS and CSS.
 * @returns The roadroller plugin.
 */
export function roadrollerPlugin(roadrollerOptions?: RoadrollerOptions, htmlMinifyOptions?: HtmlMinifyOptions): Plugin {
  const fullRoadrollerOptions = addDefaultValues(roadrollerOptions, defaultRoadrollerOptions);
  const fullHtmlMinifyOptions = addDefaultValues(htmlMinifyOptions, defaultHtmlMinifyOptions);
  return {
    name: 'vite:roadroller',
    transformIndexHtml: {
      enforce: 'post',
      transform: async (html: string, ctx?: IndexHtmlTransformContext): Promise<string> => {
        // Only use this plugin during build
        if (!ctx || !ctx.bundle) {
          return html;
        }

        const bundleKeys = Object.keys(ctx.bundle);

        const cssKey = bundleKeys.find((key) => key.endsWith('.css'));
        if (cssKey) {
          html = embedCss(html, ctx.bundle[cssKey] as OutputAsset);
          delete ctx.bundle[cssKey];
        }

        html = await htmlMinify.minify(html, fullHtmlMinifyOptions);

        const jsKey = bundleKeys.find((key) => key.endsWith('.js'));
        if (jsKey) {
          html = await embedJs(html, ctx.bundle[jsKey] as OutputChunk, fullRoadrollerOptions);
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
async function embedJs(html: string, chunk: OutputChunk, options: RoadrollerOptions): Promise<string> {
  const scriptTagRemoved = html.replace(new RegExp(`<script[^>]*?${escapeRegExp(chunk.fileName)}[^>]*?></script>`), '');
  const htmlInJs = `document.write('${scriptTagRemoved}');` + chunk.code.trim();
  const inputs: Input[] = [
    {
      data: htmlInJs,
      type: 'js' as InputType,
      action: 'eval' as InputAction,
    },
  ];
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
