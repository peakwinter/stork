import Asset from 'parcel-bundler/lib/Asset';
import localRequire from 'parcel-bundler/lib/utils/localRequire';

class MarkdownAsset extends Asset {
  constructor(name: string, options: object) {
    super(name, options);
    this.type = 'html';
    this.hmrPageReload = true;
  }

  async generate() {
    const MarkdownIt = await localRequire('markdown-it', this.name);
    const markdown = new MarkdownIt() as markdownit;

    return markdown.render(this.contents);
  }
}

// Parcel expects single-object imports when running builds and importing assets/plugins.
export = MarkdownAsset;
