import { RuntimeError } from "@/errors";
import DateFormatter from "@/modules/Util/DateFormatter";
import browser from "@/modules/Extension/browser";

/**
 * @class
 */
class PostParser {
  /**
   * @type {string}
   */
  ARTICLE_TYPE = 'article';

  /**
   * @type {string}
   */
  IMAGE_TYPE = 'image';

  /**
   * @type {string} Target page url
   */
  url;

  /**
   * @type {Object} Target context data
   */
  context;

  /**
   * @type {boolean} Whether the parse has been aborted
   */
  aborted = false;

  /**
   * @constructor
   * @param {string} url Target page url
   */
  constructor(url) {
    this.url = url;
    this.context = {};
  }

  /**
   * Create a parser instance
   * @param {string} url Target page url
   * @returns {PostParser}
   */
  static create(url) {
    return new PostParser(url);
  }

  /**
   * Set url which need to be parsed. Call this method will reset property
   * context
   * @param {string} url
   */
  setUrl(url) {
    this.url = url;
    this.context = {};
    this.aborted = false;
  }

  /**
   * Get illust's context data
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Parse the post id and creator id out from url
   * @returns {string}
   * @throws {RuntimeError}
   */
  parseUrl(url) {
    let regexes = [
      /^https:\/\/(?:www\.)?fanbox\.cc\/@([a-z\d_-]+)\/posts\/([\d]+)/i,
      /^https:\/\/([a-z\d_-]+\.)?fanbox\.cc\/posts\/([\d]+)/i
    ];

    for (let regex of regexes) {
      let matches = url.match(regex);

      if (matches) {
        this.context.creatorId = matches[1];
        this.context.postId = matches[2];
        return;
      }
    }

    throw new RuntimeError(`Can't parse the post id and creator id out. url: ${this.url}`);
  }

  /**
   * Get post's images from context data
   * @param {Object} context
   * @returns {string[]}
   */
  findImages(context) {
    let images = [];

    if (context.type === this.ARTICLE_TYPE) {
      context.body.blocks.forEach(item => {
        if (item.type === 'image' && context.body.imageMap[item.imageId]) {
          images.push(context.body.imageMap[item.imageId].originalUrl);
        }
      });
    } else if (context.type === this.IMAGE_TYPE) {
      context.body.images.forEach(image => {
        images.push(image.originalUrl);
      });
    } else {
      throw new RuntimeError(`Invalid post type. type: ${context.type}`);
    }

    return images;
  }

  /**
   * Make context standard
   * @param {Object} context
   * @returns {Object}
   */
   standardContext(context) {
    let dateFormatter = new DateFormatter(context.publishedDatetime);

    let sContext = {
      id: context.id,
      title: context.title,
      cover: context.coverImageUrl,
      userId: context.user.userId,
      userName: context.user.name,
      year: dateFormatter.getYear(),
      month: dateFormatter.getMonth(),
      day: dateFormatter.getDay(),
      pages: this.findImages(context),
      r: context.hasAdultContent,
      __raw: context,
    };

    sContext.totalPages = sContext.pages.length;

    return sContext;
  }

  /**
   * Parse post context data.
   *
   * The api request is delegated to the background service worker instead of
   * being sent from here directly. This page runs on `*.fanbox.cc` while the api
   * lives on `api.fanbox.cc`, so a direct credentialed request is cross-origin
   * and fails CORS under manifest v3 (issues #268 and #334). The background
   * worker isn't subject to page CORS and still sends the session cookie.
   *
   * @returns {Promise.<any,Error>}
   */
  async parseContext() {
    this.parseUrl(this.url);

    let response = await browser.runtime.sendMessage({
      to: 'ws',
      action: 'fanbox:postInfo',
      args: { postId: this.context.postId },
    });

    if (this.aborted) {
      return;
    }

    if (response && response.error) {
      throw new RuntimeError(`Can't fetch fanbox post ${this.context.postId} context: ${response.error}`);
    }

    if (response && response.body) {
      /**
       * Fanbox now nests the post data under `body.post`; older responses put it
       * directly on `body`. Support both so the post fields line up with what
       * standardContext expects.
       */
      let post = response.body.post || response.body;
      this.context = this.standardContext(post);
    } else {
      throw new RuntimeError(`Can't fetch fanbox post ${this.context.postId} context`);
    }
  }

  /**
   * Abort parse. The background request itself can't be cancelled, so a late
   * response is simply ignored.
   */
  abort() {
    this.aborted = true;
  }
}

export default PostParser;
