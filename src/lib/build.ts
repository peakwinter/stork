import Bundler from 'parcel-bundler';
import path from 'path';

/** Build the site. */
export default async function build(sitePath: string) {
  const outDir = path.join(path.resolve(sitePath), 'dist');
  const entryFiles = [
    path.join(sitePath, './index.pug'),
    path.join(sitePath, './pages/**/*.pug'),
    path.join(sitePath, './posts/**/*.md'),
  ];
  const options: Bundler.ParcelOptions = {
    outDir,
    cache: false,
    watch: false, // Whether to watch the files and rebuild them on change, defaults to process.env.NODE_ENV !== 'production'
    contentHash: false, // Disable content hash from being included on the filename
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    logLevel: 3, // 5 = save everything to a file, 4 = like 3, but with timestamps and additionally log http requests to dev server, 3 = log info, warnings & errors, 2 = log warnings & errors, 1 = log errors
    hmrPort: 0, // The port the HMR socket runs on, defaults to a random free port (0 in node.js resolves to a random free port)
    sourceMaps: true // Enable or disable sourcemaps, defaults to enabled (minified builds currently always create sourcemaps)
  };

  const bundler = new Bundler(entryFiles, options);
  bundler.addAssetType('.pug', require.resolve('./assets/pug'));
  bundler.addAssetType('.md', require.resolve('./assets/markdown'));

  await bundler.bundle();
  // or serve with
  // await bundler.serve();
}
