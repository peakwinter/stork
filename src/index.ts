import * as fs from 'fs';
import * as Bundler from 'parcel-bundler';
import * as path from 'path';
import * as util from 'util';

const fsReaddir = util.promisify(fs.readdir);
const fsStat = util.promisify(fs.stat);

/** Walk a directory and obtain all of its subdirectories and files recursively. */
async function walk(dir: string): Promise<string[]> {
  const results: string[] = [];
  const dirListing = await fsReaddir(dir);
  for (const item of dirListing) {
    const itemPath = path.join(dir, item);
    const stats = await fsStat(itemPath);
    if (stats.isDirectory()) {
      results.concat(await walk(itemPath));
    } else if (stats.isFile()) {
      results.push(itemPath);
    }
  }
  return results;
}

/** Scour the local directory and find all files that could be considered entrypoints (all pages) */
async function buildEntrypoints(directory: string) {
  const directoryName = directory || __dirname;
  const files = await walk(directoryName);
  const pugFiles: string[] = [];
  for (const item of files) {
    if (path.parse(item).ext === '.pug') {
      pugFiles.push(item);
    }
  }
  return pugFiles;
}

/** Build the site. */
async function build(sitePath: string) {
  const outDir = path.join(sitePath, 'dist');
  const entryFiles = [
    path.join(sitePath, 'index.pug'),
    ...await buildEntrypoints(path.join(sitePath, 'pages')),
  ];
  const options: Bundler.ParcelOptions = {
    outDir,
    watch: false, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    contentHash: false, // Disable content hash from being included on the filename
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors
    hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: true // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  };

  const bundler = new Bundler(entryFiles, options);
  await bundler.bundle();
  // or serve with
  // await bundler.serve();
}
