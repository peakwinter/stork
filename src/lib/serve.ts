import finalhandler from 'finalhandler';
import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import watch from 'glob-watcher';

import build from './build';
import { Request, Response } from 'express-serve-static-core';

export default async function serve(sitePath: string) {
  const absolutePath = path.resolve(sitePath);
  const outDir = path.join(absolutePath, 'dist');

  await build(sitePath);
  console.log('');

  const globs = [
    path.join(absolutePath, 'index.pug'),
    path.join(absolutePath, 'templates/**/*.pug'),
    path.join(absolutePath, 'pages/**/*.pug'),
    path.join(absolutePath, 'posts/**/*.md'),
    path.join(absolutePath, 'assets/**/*'),
  ];

  const watcher = watch(globs, async() => {
    await build(sitePath);
    console.log('');
  });
  watcher.on('change', (path) => {
    console.log(`${path} updated - rebuilding`);
  });

  const serve = serveStatic(outDir);
  const server = http.createServer((req: Request, res: Response) =>
    serve(req, res, finalhandler(req, res)),
  );

  console.log('Now listening on http://localhost:3000');
  server.listen(3000);
}
