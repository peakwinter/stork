import fs from 'fs-extra';
import path from 'path';
import pLimit from 'p-limit';
import pug from 'pug';

import { getRenderingContext, RenderingContext, PostData } from '../utils';
import { BuildOptions } from '../config';

export async function buildPugFile(
  filePath: string,
  baseDir: string,
  outputDir: string,
  context?: RenderingContext,
): Promise<void> {
  const fullPath = path.join(baseDir, filePath);
  const compiled = pug.renderFile(fullPath, {
    compileDebug: false,
    filename: filePath,
    basedir: baseDir,
    pretty: true,
    filters: {},
    ...(context || {}),
  });
  const outputFilePath = filePath.startsWith('./pages')
    ? path.join(
        outputDir, filePath.replace('./pages', '.').replace(path.extname(filePath), '/index.html'),
      )
    : path.join(outputDir, path.basename(filePath).replace(path.extname(filePath), '.html'));
  await fs.ensureDir(path.dirname(outputFilePath));
  await fs.writeFile(path.join(outputFilePath), compiled);
}

export async function buildPug(
  paths: string[], postData: PostData[] | null, options: BuildOptions,
) {
  const pugPool = pLimit(3);
  const context = getRenderingContext(options.config, options.plugins, {}, postData || []);
  const input = paths.map(filePath =>
    pugPool(() => buildPugFile(filePath, options.baseDir, options.outputDir, context)),
  );
  await Promise.all(input);
}
