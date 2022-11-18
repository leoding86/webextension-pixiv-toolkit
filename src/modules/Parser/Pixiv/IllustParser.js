import { RuntimeError } from "@/errors";
import DateFormatter from "@/modules/Util/DateFormatter";
import Request from "@/modules/Net/Request";

/**
 * @class
 */
class IllustParser {
  /**
   * @type {number}
   */
  static ILLUST_TYPE = 0;

  /**
   * @type {number}
   */
  static MANGA_TYPE = 1;

  /**
   * @type {number}
   */
  static UGOIRA_TYPE = 2;

  /**
   * @type {string} Target page url
   */
  url;

  /**
   * @type {object} Target context data
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
  }

  /**
   * Create a parser instance
   * @param {string} url Target page url
   * @returns {IllustParser}
   */
  static create(url) {
    return new IllustParser(url);
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
   * Check if the illust is illust type
   * @returns {boolean}
   */
  isIllust() {
    return this.context.illustType === IllustParser.ILLUST_TYPE;
  }

  /**
   * Check if the illust is manga type
   * @returns {boolean}
   */
  isManga() {
    return this.context.illustType === IllustParser.MANGA_TYPE;
  }

  /**
   * Check if the illust is ugoira type
   * @returns {boolean}
   */
  isUgoira() {
    return this.context.illustType === IllustParser.UGOIRA_TYPE;
  }

  /**
   * Parse illust's context
   * @throws {RuntimeError}
   */
  async parseContext() {
    this.parseUrl(this.url);

    await this.parseInfo();

    if ([IllustParser.ILLUST_TYPE, IllustParser.MANGA_TYPE].indexOf(this.context.illustType) > -1) {
      await this.parsePages(this.context.id);
    } else if (this.context.illustType === IllustParser.UGOIRA_TYPE) {
      await this.parseUgoiraMeta(this.context.id);
    } else {
      throw new RuntimeError(`Invalid illust type ${this.context.illustType}`);
    }
  }

  /**
   * Parse context out from url string
   * @param {string} url
   * @returns
   * @throws {RuntimeError}
   */
  parseUrl(url) {
    let regexes = [/illust_id=(\d+)/, /artworks\/(\d+)/];

    for (let regex of regexes) {
      let matches = url.match(regex);

      if (matches) {
        this.context.id = matches[1];
        return;
      }
    }

    throw new RuntimeError(`Can't parse the illust id out. url: ${this.url}`);
  }

  /**
   * Build url which will represet illust's information.
   * @param {string} id
   * @returns {string}
   */
  buildInfoUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}`;
  }

  /**
   * Make illust's context standard
   * @param {Object} context
   * @returns {Object}
   */
  standardContext(context) {
    let dateFormatter = DateFormatter.getDefault(context.createDate);

    return {
      illustId: context.illustId,
      illustTitle: context.illustTitle,
      illustType: context.illustType,
      userName: context.userName,
      userId: context.userId,
      userAccount: context.userAccount,
      urls: context.urls, // Inlcude different sizes of thumbnail
      r: context.xRestrict,

      id: context.illustId,
      title: context.illustTitle,
      cover: context.urls.thumb,
      comment: context.illustComment,
      description: context.description,
      createDate: context.createDate,
      uploadDate: context.uploadDate,
      type: 'Illust',
      bookmarkCount: context.bookmarkCount,
      likeCount: context.likeCount,
      responseCount: context.responseCount,
      viewCount: context.viewCount,

      // contexts from parsed
      year: dateFormatter.getYear(),
      month: dateFormatter.getMonth(),
      day: dateFormatter.getDay()
    }
  }

  /**
   * Parse illust base information
   * @param {string} id
   * @returns {Promise.<any,Error>}
   */
  parseInfo(id) {
    return new Promise((resolve, reject) => {
      this.request = new Request(this.buildInfoUrl(id), { method: 'GET' });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json && json.body) {
          this.context = this.standardContext(json.body);

          resolve();
        }
      });

      this.request.addListener('onerror', error => {
        reject(error);
      })

      this.request.send();
    });
  }

  /**
   * Build url which will represet illust's pages.
   * @param {string} id
   * @returns {string}
   */
  buildPagesUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}/pages`;
  }

  /**
   * Parse illust's pages
   * @param {string} id
   * @returns {Promise.<any,Error>}
   */
  parsePages(id) {
    return new Promise((resolve, reject) => {
      this.request = new Request(this.buildPagesUrl(id), { method: 'GET' });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json.error) {
          reject();
          return;
        }

        // Parse pages information here
        this.context.pages = json.body.map(page => page.urls.original);

        resolve();
      });

      this.request.addListener('onerror', error => {
        reject(error);
      });

      this.request.send();
    });
  }

  /**
   * Build url which will represet ugoira's meta data.
   * @param {string} id
   * @returns {string}
   */
  buildUgoiraMetaUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}/ugoira_meta`;
  }

  /**
   * Parse ugoira's meta data
   * @param {string} id
   * @returns {Promise.<any,Error>}
   */
  parseUgoiraMeta(id) {
    return new Promise((resolve, reject) => {
      this.request = new Request(this.buildUgoiraMetaUrl(id), { method: 'GET' });

      this.request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json.error) {
          reject(new RuntimeError(json.error));
          return;
        }

        this.context.illustSrc = json.body.src;
        this.context.illustOriginalSrc = json.body.originalSrc;
        this.context.illustFrames = json.body.frames;
        this.context.illustMimeType = json.body.mime_type;
        this.context.__metadata = json.body;

        let duration = 0

        this.context.illustFrames.forEach(function (frame) {
          duration += frame.delay;
        });

        this.context.illustDuration = duration;

        resolve();
      });

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

export default IllustParser;
