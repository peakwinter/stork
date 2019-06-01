import { Command, flags } from '@oclif/command';

import serve from '../lib/serve';

export default class Serve extends Command {
  static description = 'serves static site source files and rebuilds on changes';

  static examples = [
    `$ stork serve
✨  Built in 358ms.
`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
    path: flags.string({ char: 'p', description: 'path to site source' }),
  };

  async run() {
    const { flags } = this.parse(Serve);

    const sourcePath = flags.path || process.cwd();
    await serve(sourcePath);
  }
}
