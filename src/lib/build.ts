import fs from 'fs-extra';
import glob from 'fast-glob';
import path from 'path';
import Bundler from 'parcel-bundler';

import { loadConfig, loadPlugins, Config } from './config';
import { buildPug } from './assets/pug';
import { buildMarkdown } from './assets/markdown';

/** Build the site. */
export default async function build(
  sitePath: string, config: Config = {}, parcelOptions: Bundler.ParcelOptions = {},
) {
  const absolutePath = path.resolve(sitePath);
  const outDir = path.join(absolutePath, 'dist');
  const prod = config.env === 'production' || process.env.NODE_ENV === 'production' || false;
  await fs.ensureDir(outDir);

  // Load config and plugins
  let storkConfig = config;
  if (!storkConfig) {
    const configPath = path.join(sitePath, 'stork.yaml');
    storkConfig = await loadConfig(configPath, sitePath);
  }
  const plugins = await loadPlugins(config);

  // Fetch paths for building pug pages (index and site pages)
  const pugPaths = await glob<string>(
    ['./index.pug', './pages/**/*.pug'],
    { cwd: sitePath, onlyFiles: true },
  );
  const mdPaths = await glob<string>('./posts/**/*.md', { cwd: sitePath, onlyFiles: true });

  // Create temporary directory for pre-processing Pug and Markdown files
  const tmpDir = path.join(sitePath, '.tmp');
  await fs.remove(tmpDir);
  await fs.ensureDir(tmpDir);

  // Build Markdown pages
  console.log('Building blog posts...');
  const postData = await buildMarkdown(
    mdPaths, { config, plugins, baseDir: absolutePath, outputDir: tmpDir },
  );
  // Build pug pages
  console.log('Building index and pages...');
  await buildPug(pugPaths, postData, { config, plugins, baseDir: absolutePath, outputDir: tmpDir });

  // Symlink assets into tmp dir so Parcel will properly link them
  await fs.symlink(path.join(absolutePath, 'assets'), path.join(tmpDir, 'assets'));

  // Build assets and final site package using Parcel
  const entryFiles = [
    path.join(tmpDir, './index.html'),
    path.join(tmpDir, './*.html'),
    path.join(tmpDir, './**/*.html'),
  ];
  const options: Bundler.ParcelOptions = {
    outDir,
    cache: false,
    watch: false,
    contentHash: prod,
    minify: prod,
    logLevel: 3,
    hmrPort: 0,
    sourceMaps: !!prod,
    ...parcelOptions,
  };

  const bundler = new Bundler(entryFiles, options);

  console.log('Building assets...');
  await bundler.bundle();

  await fs.remove(tmpDir);
}
