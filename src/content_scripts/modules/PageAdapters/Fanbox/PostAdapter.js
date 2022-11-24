import { FanboxPostParser } from "@/modules/Parser";
import { FanboxPostResource } from "@/modules/PageResource";
import AbstractAdapter from "@/content_scripts/modules/PageAdapters/AbstractAdapter";

/**
 * @class
 */
class PostAdapter extends AbstractAdapter {
  /**
   * @type {FanboxPostParser}
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
   * @returns {PostAdapter}
   */
  static getAdapter({ url }) {
    return new PostAdapter(url);
  }

  async getResource() {
    this.parser = FanboxPostParser.create(this.url);
    await this.parser.parseContext();
    let context = this.parser.getContext();

    /**
     * Append url to context
     */
    context.url = this.url;
    return FanboxPostResource.create(context);
  }

  abort() {
    this.parser && this.parser.abort();
  }
}

export default PostAdapter;
