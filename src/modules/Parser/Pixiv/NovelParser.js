import { RuntimeError } from "@/errors";
import DateFormatter from "@/modules/Util/DateFormatter";
import Request from "@/modules/Net/Request";

/**
 * @class
 */
class NovelParser {
  /**
   * @type {string} Target page url
   */
  url;

  /**
   * @type {Object} Target context data
   */
  context;

  /**
   * @type {Request}
   */
  request;

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
   * @returns {NovelParser}
   */
  static create(url) {
    return new NovelParser(url);
  }

  /**
   * Set url which need to be parsed. Call this method will reset property
   * context
   * @param {string} url
   */
  setUrl(url) {
    this.url = url;
    this.context = {};
  }

  /**
   * Get illust's context data
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Parse the novel id out from the url string
   * @returns {string}
   * @throws {RuntimeError}
   */
  parseUrl(url) {
    let regexes = [/novel\/show\.php\?id=(\d+)/];

    for (let regex of regexes) {
      let matches = url.match(regex);

      if (matches) {
        this.context.id = matches[1];
        return;
      }
    }

    throw new RuntimeError(`Can't parse the novel id out. url: ${this.url}`);
  }

  /**
   * Make context standard
   * @param {object} context
   * @returns {object}
   */
  standardContext(context) {
    let dateFormatter = DateFormatter.getDefault(context.createDate);

    let sectionContents = context.content.split(/[\r\n|\r|\n]\[newpage\][\r\n|\r\n]/i);

    let sections = sectionContents.map(content => {
      let newContent = content.replace(/[\r\n|\r|\n]/g, '<br />');
      return newContent;
    });

    let sContext = {
      userName: context.userName,
      userId: context.userId,
      r: context.xRestrict,

      id: context.id,
      title: context.title,
      description: context.description,
      coverUrl: context.coverUrl,
      cover: context.coverUrl,
      sections,
      createDate: context.createDate,
      uploadDate: context.uploadDate,
      type: 'Novel',
      bookmarkCount: context.bookmarkCount,
      likeCount: context.likeCount,
      viewCount: context.viewCount,

      // contexts from parsed
      year: dateFormatter.getYear(),
      month: dateFormatter.getMonth(),
      day: dateFormatter.getDay()
    }

    // series data
    if (context.seriesNavData) {
      sContext.seriesId = context.seriesNavData.seriesId;
      sContext.seriesTitle = context.seriesNavData.title;
      sContext.seriesOrder = context.seriesNavData.order;
    }

    return sContext;
  }

  /**
   * Build the url which will represet novel's context data
   * @param {string} id
   * @returns {string}
   */
  buildContextUrl(id) {
    return `https://www.pixiv.net/ajax/novel/${id}`;
  }

  /**
   * Parse novel context data
   * @returns {Promise.<any,Error>}
   */
  parseContext() {
    this.parseUrl(this.url);

    return new Promise((resolve, reject) => {
      this.request = new Request(this.buildContextUrl(this.context.id), { method: 'GET' });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json && json.body) {
          this.context = this.standardContext(json.body);

          resolve();
        } else {
          reject(new RuntimeError(`Can't parse novel context out`));
        }
      });

      this.request.addListener('onerror', error => {
        reject(error);
      })

      this.request.send();
    });
  }

  /**
   * Abort request
   */
  abort() {
    if (this.request) {
      this.request.abort();
    }
  }
}

export default NovelParser;
