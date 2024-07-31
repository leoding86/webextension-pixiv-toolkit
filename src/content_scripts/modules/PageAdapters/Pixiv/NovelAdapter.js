import { PixivNovelParser } from "@/modules/Parser";
import { PixivNovelResource } from "@/modules/PageResource";
import AbstractAdapter from "@/content_scripts/modules/PageAdapters/AbstractAdapter";

/**
 * @class
 */
class NovelAdapter extends AbstractAdapter {
  /**
   * @type {PixivNovelParser}
   */
  parser;

  /**
   *
   * @param {string} url
   */
  constructor(url) {
    super(url);
  }

  /**
   *
   * @param {{url: string}} param0
   * @returns {NovelAdapter}
   */
  static getAdapter({ url }) {
    return new NovelAdapter(url);
  }

  async getResource() {
    this.parser = PixivNovelParser.create(this.url);
    await this.parser.parseContext();
    let context = this.parser.getContext();

    /**
     * Append url to context
     */
    context.url = this.url;
    return PixivNovelResource.create(context);
  }

  abort() {
    if (this.parser) {
      this.parser.abort();
    }
  }
}

export default NovelAdapter;
