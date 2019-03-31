import path from 'path';
import localRequire from 'parcel-bundler/lib/utils/localRequire';

import StorkAsset from '.';

class PugAsset extends StorkAsset {
  constructor(name: string, options: object) {
    super(name, options);
    this.type = 'html';
    this.hmrPageReload = true;
  }

  async generate() {
    const pug = await localRequire('pug', this.name);
    const config = {
      pretty: false,
      locals: {},
      filters: [],
      filterOptions: {},
      filterAliases: {},
    };

    const compiled = pug.compile(this.contents, {
      compileDebug: false,
      filename: this.name,
      basedir: path.dirname(this.name),
      pretty: config.pretty || false,
      templateName: path.basename(this.basename, path.extname(this.basename)),
      filters: config.filters,
      filterOptions: config.filterOptions,
      filterAliases: config.filterAliases,
    });

    if (compiled.dependencies) {
      for (const item of compiled.dependencies) {
        this.addDependency(item, {
          includedInParent: true,
        });
      }
    }

    return compiled(this.getRenderingContext(config.locals));
  }
}

// Parcel expects single-object imports when running builds and importing assets/plugins.
export = PugAsset;
