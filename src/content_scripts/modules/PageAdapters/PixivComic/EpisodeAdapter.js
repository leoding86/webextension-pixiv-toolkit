import { PixivComicEpisodeParser } from "@/modules/Parser";
import { PixivComicEpisdoeResource } from "@/modules/PageResource";
import AbstractAdapter from "@/content_scripts/modules/PageAdapters/AbstractAdapter";

/**
 * @class
 */
class EpisodeAdapter extends AbstractAdapter {
  /**
   * @type {PixivComicEpisodeParser}
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
   * @returns {EpisodeAdapter}
   */
  static getAdapter({ url }) {
    return new EpisodeAdapter(url);
  }

  async getResource() {
    this.parser = PixivComicEpisodeParser.create(this.url);
    await this.parser.parserContext();
    let context = this.parser.getContext();

    /**
     * Append url to context
     */
    context.url = this.url;
    return PixivComicEpisdoeResource.create(context);
  }

  abort() {
    if (this.parser) {
      this.parser.abort();
    }
  }
}

export default EpisodeAdapter;
