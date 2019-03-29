import Asset from 'parcel-bundler/lib/Asset';
import localRequire from 'parcel-bundler/lib/utils/localRequire';

class MarkdownAsset extends Asset {
  frontMatter: { [k: string]: string; };

  constructor(name: string, options: object) {
    super(name, options);
    this.type = 'html';
    this.hmrPageReload = true;
  }

  async transform() {
    // Obtain the front matter for this post (if any)
    const matter = await localRequire('gray-matter', this.name);
    const output = matter(this.contents);
    this.contents = output.content;
    this.frontMatter = output.data;
  }

  async generate() {
    const MarkdownIt = await localRequire('markdown-it', this.name);
    const markdown = new MarkdownIt() as markdownit;

    return markdown.render(this.contents);
  }
}

// Parcel expects single-object imports when running builds and importing assets/plugins.
export = MarkdownAsset;
