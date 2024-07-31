import { PixivIllustParser } from "@/modules/Parser";
import { PixivIllustResource } from "@/modules/PageResource";
import AbstractAdapter from "@/content_scripts/modules/PageAdapters/AbstractAdapter";

/**
 * @class
 */
class IllustAdapter extends AbstractAdapter {
  /**
   * @type {PixivIllustParser}
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
   * @returns {IllustAdapter}
   */
  static getAdapter({ url }) {
    return new IllustAdapter(url);
  }

  async getResource() {
    this.parser = PixivIllustParser.create(this.url);
    await this.parser.parseContext();
    let context = this.parser.getContext();

    /**
     * Append url to context
     */
    context.url = this.url;
    return PixivIllustResource.create(context);
  }

  abort() {
    if (this.parser) {
      this.parser.abort();
    }
  }
}

export default IllustAdapter;
