import fs from 'fs-extra';
import highlight from 'highlight.js';
import path from 'path';
import pLimit from 'p-limit';
import pug from 'pug';
import grayMatter from 'gray-matter';
import markdownIt from 'markdown-it';

const markdownItAttrs: any = require('markdown-it-attrs');
const markdownItFootnote: any = require('markdown-it-footnote');

import {
  getRenderingContext, RenderingContext, getPostDataRenderingContext, PostData,
} from '../utils';
import { BuildOptions } from '../config';

export async function buildMarkdownFile(
  filePath: string,
  baseDir: string,
  outputDir: string,
  context: RenderingContext,
  options: BuildOptions,
): Promise<PostData> {
  const markdown = new markdownIt({
    highlight(str, lang) {
      if (lang && highlight.getLanguage(lang)) {
        try {
          return highlight.highlight(lang, str).value;
        } catch (__) {}
      }
      return '';
    },
  });
  markdown.use(markdownItAttrs);
  markdown.use(markdownItFootnote);

  const fullPath = path.join(baseDir, filePath);
  const contents = await fs.readFile(fullPath, { encoding: 'utf8' });

  const parsed = grayMatter(contents);
  let compiled = markdown.render(parsed.content);
  const postData = await getPostDataRenderingContext(filePath, parsed.data, options.config);

  if (parsed.data && parsed.data.template) {
    // This file depends on a Pug template. Render its contents in that template
    const postContent = ['\n\t'];
    let preBlockLevel = 0;
    for (const line of compiled.split('\n')) {
      if (line.startsWith('<pre>')) preBlockLevel += 1;
      if (preBlockLevel) {
        postContent.push(line);
      } else {
        postContent.push(`\t${line}`);
      }
      if (line.endsWith('</pre>')) preBlockLevel -= 1;
    }

    const pugContentBlock =
      `extends /templates/${parsed.data.template}\n\nblock content\n\t!=postContent`;
    const compiler = pug.compile(pugContentBlock, {
      filename: fullPath,
      basedir: baseDir,
      pretty: true,
      compileDebug: false,
    });
    compiled = compiler({
      ...context,
      page: context.page || {},
      post: postData,
      postContent: postContent.join('\n'),
    });
  }

  const outputFilePath = path.join(
    outputDir, options.config.permalinkPrefix || 'posts', postData.slug, 'index.html',
  );
  await fs.ensureDir(path.dirname(outputFilePath));
  await fs.writeFile(path.join(outputFilePath), compiled);
  return postData;
}

export async function buildMarkdown(paths: string[], options: BuildOptions) {
  const mdPool = pLimit(3);
  const context = getRenderingContext(options.config, options.plugins);
  const input = paths.map(filePath =>
    mdPool(() =>
      buildMarkdownFile(filePath, options.baseDir, options.outputDir, context, options),
    ),
  );
  const postDatas = await Promise.all(input);
  return postDatas.sort((a, b) => a.date.valueOf() - b.date.valueOf());
}
