import dashify from 'dashify';
import fs from 'fs-extra';
import grayMatter from 'gray-matter';
import moment from 'moment';
import path from 'path';
import { Config, Helpers, Plugins } from './config';

export interface RenderingContext {
  config?: Config;
  helpers: Helpers;
  page: Object;
  post: PostData | object;
  posts: PostData[];
}

export interface PostData {
  slug: string;
  title: string;
  summary: string;
  date: moment.Moment;
  permalink: string;
}

export function getRenderingContext(
  config: Config = {},
  plugins: Plugins = {},
  frontMatter = {},
  posts: PostData[] = [],
): RenderingContext {
  const helpers = Object.entries(plugins).reduce((agg, [pluginName, plugin]) => {
    if (!plugin.helpers) return agg;
    for (const [helperName, helper] of Object.entries(plugin.helpers)) {
      agg[helperName] = helper;
    }
    return agg;
  },                                             {} as Helpers);
  return { config, helpers, posts, page: frontMatter, post: frontMatter };
}

export async function getPostDataRenderingContext(
  filePath: string,
  data: grayMatter.GrayMatterFile<string>['data'],
  config: Config,
): Promise<PostData> {
  const fileName = path.basename(filePath).replace(path.extname(filePath), '');
  const fileStats = await fs.stat(filePath);
  const title = data.title || 'Unknown title';
  const slug = data.slug || dashify(fileName);
  return {
    ...data,
    slug,
    title,
    summary: data.summary || '',
    date: data.date ? moment(data.date) : moment(fileStats.birthtime),
    permalink: data.permalink || `/${config.permalinkPrefix || 'blog'}/${slug}`,
  };
}
