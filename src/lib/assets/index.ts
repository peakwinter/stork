import Asset from 'parcel-bundler/lib/Asset';
import Parcel from 'parcel-bundler';
import md5 from 'parcel-bundler/lib/utils/md5';
import localRequire from 'parcel-bundler/lib/utils/localRequire';
import { Config, loadConfig } from '../config';

interface AssetOptions extends Parcel.ParcelOptions {
  production: boolean;
  rootDir: string;
}

interface PluginExport {
  pretransforms?: Function[];
  posttransforms?: Function[];
  helpers?: Function[];
}

export default class StorkAsset extends Asset {
  options: AssetOptions;
  config?: Config;
  plugins?: { [k: string]: PluginExport };
  frontMatter: { [k: string]: string; };

  async process() {
    if (!this.id) {
      this.id =
        this.options.production || this.options.scopeHoist
          ? md5(this.relativeName, 'base64').slice(0, 4)
          : this.relativeName;
    }

    // Load Stork configuration and plugins
    const configPath = await this.getConfig(['stork.yaml'], { load: false });
    this.config = await loadConfig(configPath, this.options.rootDir);
    await this.loadPlugins();

    if (!this.generated) {
      await this.loadIfNeeded();
      await this.pretransform();
      await this.getDependencies();
      await this.transform();
      this.generated = await this.generate();
    }

    return this.generated;
  }

  async loadPlugins() {
    if (!this.config || !this.config.plugins) return;
    if (!this.plugins) this.plugins = {};
    for (const pluginName of this.config.plugins) {
      this.plugins[pluginName] = await localRequire(pluginName, this.name) as PluginExport;
    }
  }

  getRenderingContext(locals = {}) {
    return {
      locals,
      helpers: this.plugins
        ? Object.values(this.plugins).reduce(
          (agg, plugin) => agg.concat(plugin.helpers || []), [] as Function[])
        : [],
      config: this.config,
      page: this.frontMatter || {},
    };
  }
}
