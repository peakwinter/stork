import fs from 'fs-extra';
import path from 'path';
import pLimit from 'p-limit';
import pug from 'pug';
import grayMatter from 'gray-matter';
import markdownIt from 'markdown-it';

import { getRenderingContext, RenderingContext } from '../utils';
import { BuildOptions } from '../config';

export async function buildMarkdownFile(
  filePath: string,
  baseDir: string,
  outputDir: string,
  context?: RenderingContext,
): Promise<void> {
  const markdown = new markdownIt();
  const fullPath = path.join(baseDir, filePath);
  const contents = await fs.readFile(fullPath, { encoding: 'utf8' });

  const parsed = grayMatter(contents);
  let compiled = markdown.render(parsed.content);

  if (parsed.data && parsed.data.template) {
    // This file depends on a Pug template. Render its contents in that template
    compiled = `\n\t${compiled.split('\n').join('\n\t')}`;
    const pugContentBlock =
      `extends ../templates/${parsed.data.template}\n\nblock content\n\t!=content`;
    const compiler = pug.compile(pugContentBlock, {
      filename: fullPath,
      basedir: path.dirname(fullPath),
      pretty: true,
      compileDebug: false,
    });
    compiled = compiler({
      ...(context || {}),
      page: {
        ...(context ? context.page : {}),
        ...parsed.data,
      },
      content: compiled,
    });
  }

  await fs.ensureDir(path.join(outputDir, path.dirname(filePath)));
  await fs.writeFile(
    path.join(outputDir, filePath.replace(path.extname(filePath), '.html')), compiled,
  );
}

export async function buildMarkdown(paths: string[], options: BuildOptions) {
  const mdPool = pLimit(3);
  const context = getRenderingContext(options.config, options.plugins);
  const input = paths.map(filePath =>
    mdPool(() => buildMarkdownFile(filePath, options.baseDir, options.outputDir, context)),
  );
  await Promise.all(input);
}
