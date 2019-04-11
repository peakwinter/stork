import { Config, Helpers, Plugins } from './config';

export interface RenderingContext {
  config?: Config;
  helpers: Helpers;
  page?: Object;
}

export function getRenderingContext(
  config: Config = {},
  plugins: Plugins = {},
  frontMatter = {},
): RenderingContext {
  const helpers = Object.entries(plugins).reduce((agg, [pluginName, plugin]) => {
    if (!plugin.helpers) return agg;
    for (const [helperName, helper] of Object.entries(plugin.helpers)) {
      agg[helperName] = helper;
    }
    return agg;
  },                                             {} as Helpers);
  return { config, helpers, page: frontMatter };
}
