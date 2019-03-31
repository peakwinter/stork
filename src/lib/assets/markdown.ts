import path from 'path';
import localRequire from 'parcel-bundler/lib/utils/localRequire';

import StorkAsset from '.';

class MarkdownAsset extends StorkAsset {
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
    const pug = await localRequire('pug', this.name);
    const markdownOutput = markdown.render(this.contents);

    if (this.frontMatter && this.frontMatter.template) {
      // This file depends on a Pug template. Render its contents in that template
      const pugContentBlock =
        `extends ../templates/${this.frontMatter.template}\n\nblock content\n\t!=content`;
      const compiled = pug.compile(pugContentBlock, {
        filename: this.name,
        basedir: path.dirname(this.name),
        templateName: path.basename(this.basename, path.extname(this.basename)),
        compileDebug: false,
      });
      return compiled({ ...this.getRenderingContext(), content: markdownOutput });
    }

    return markdownOutput;
  }
}

// Parcel expects single-object imports when running builds and importing assets/plugins.
export = MarkdownAsset;
