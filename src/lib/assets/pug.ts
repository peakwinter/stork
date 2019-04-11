import fs from 'fs-extra';
import path from 'path';
import pLimit from 'p-limit';
import pug from 'pug';

import { getRenderingContext, RenderingContext } from '../utils';
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
    basedir: path.dirname(fullPath),
    pretty: true,
    filters: {},
    ...(context || {}),
  });
  await fs.ensureDir(path.join(outputDir, path.dirname(filePath)));
  await fs.writeFile(
    path.join(outputDir, filePath.replace(path.extname(filePath), '.html')), compiled,
  );
}

export async function buildPug(paths: string[], options: BuildOptions) {
  const pugPool = pLimit(3);
  const context = getRenderingContext(options.config, options.plugins);
  const input = paths.map(filePath =>
    pugPool(() => buildPugFile(filePath, options.baseDir, options.outputDir, context)),
  );
  await Promise.all(input);
}
