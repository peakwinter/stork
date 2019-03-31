import fs from 'fs';
import util from 'util';
import yaml from 'js-yaml';

const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);

let cachedConfig: Config | null = null;

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

  blog?: {
    permalink?: string;
  };

  plugins?: string[];
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
  if (!(await exists(configPath))) throw new ConfigNotFoundError(configPath);

  const rawContents = await readFile(configPath, { encoding: 'utf8' });
  cachedConfig = yaml.safeLoad(rawContents);
  return { ...cachedConfig } as Config;
}
