import { Command, flags } from '@oclif/command';

import build from '../lib/build';

export default class Build extends Command {
  static description = 'builds static site source files into a HTML/asset bundle';

  static examples = [
    `$ stork build
✨  Built in 358ms.
`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
    path: flags.string({ char: 'p', description: 'path to site source' }),
  };

  async run() {
    const { flags } = this.parse(Build);

    const sourcePath = flags.path || process.cwd();
    await build(sourcePath);
  }
}
