import finalhandler from 'finalhandler';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import watch from 'glob-watcher';
import { Request, Response } from 'express-serve-static-core';
import { ParcelOptions } from 'parcel-bundler';

import build from './build';
import { loadConfig } from './config';

export default async function serve(sitePath: string) {
  const absolutePath = path.resolve(sitePath);
  const outDir = path.join(absolutePath, 'dist');
  const configPath = path.join(sitePath, 'stork.yaml');
  const config = await loadConfig(configPath, sitePath);
  const port = config.serverPort || 3000;

  const parcelOptions: ParcelOptions = { cache: true, logLevel: 2 };

  await build(sitePath, config, parcelOptions);

  const globs = [
    path.join(absolutePath, 'index.pug'),
    path.join(absolutePath, 'templates/**/*.pug'),
    path.join(absolutePath, 'pages/**/*.pug'),
    path.join(absolutePath, 'posts/**/*.md'),
    path.join(absolutePath, 'assets/**/*'),
  ];

  const watcher = watch(globs, async() => {
    await build(sitePath, config, parcelOptions);
    console.log('Rebuild complete');
  });
  watcher.on('change', (path) => {
    console.log(`${path} updated - rebuilding`);
  });

  const serve = serveStatic(outDir);
  const server = http.createServer((req: Request, res: Response) =>
    serve(req, res, finalhandler(req, res)),
  );

  console.log('');
  console.log(`Now listening on http://localhost:${port}`);
  server.listen(port);
}
