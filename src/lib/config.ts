import fs from 'fs-extra';
import yaml from 'js-yaml';

import { Config, Plugins, Helpers } from './config';

let cachedConfig: Config | null = null;

export interface Helpers {
  [helperName: string]: Function;
}

export interface PluginExport {
  pretransforms?: Function[];
  posttransforms?: Function[];
  helpers?: Helpers;
}

export interface Plugins {
  [pluginName: string]: PluginExport;
}

export interface BuildOptions {
  baseDir: string;
  outputDir: string;
  config: Config;
  plugins?: Plugins;
}

export interface Config {
  title?: string;
  email?: string;
  description?: string;
  url?: string;
  author?: {
    name: string;
    [authorAttr: string]: any;
  };
  logo?: string;

  permalinkPrefix?: string;
  plugins?: string[];

  serverPort?: number;

  [configAttr: string]: any;
}

export class ConfigNotFoundError extends Error {
  constructor(configPath?: string) {
    super();
    this.message = configPath
      ? `Config file not found at ${configPath}`
      : 'Config file not found at site root';
  }
}

export async function loadConfig(
  configPath: string | null,
  basedir: string,
  force?: boolean,
): Promise<Config> {
  if (cachedConfig && !force) return { ...cachedConfig };
  if (!configPath) throw new ConfigNotFoundError(basedir);
  if (!(await fs.pathExists(configPath))) throw new ConfigNotFoundError(configPath);

  const rawContents = await fs.readFile(configPath, { encoding: 'utf8' });
  cachedConfig = yaml.safeLoad(rawContents);
  return { ...cachedConfig } as Config;
}

export async function loadPlugins(config: Config): Promise<Plugins> {
  const plugins: {[pluginName: string]: PluginExport} = {};
  if (!config || !config.plugins) return plugins;
  for (const pluginName of config.plugins) {
    plugins[pluginName] = require(pluginName) as PluginExport;
  }
  return plugins;
}
