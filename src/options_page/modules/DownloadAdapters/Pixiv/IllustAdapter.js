import { app } from "@/options_page/DownloadsApplication";
import { RuntimeError } from "@/errors";
import {
  IllustDownloadTask,
  MangaDownloadTask,
  UgoiraDownloadTask
} from "@/options_page/modules/DownloadTasks";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import DateFormatter from "@/modules/Util/DateFormatter";
import Request from "@/modules/Net/Request";

class IllustAdapter {
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
   * @constructor
   * @param {string} url Target page url
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * Create a adapter instance
   * @param {string} url Target page url
   * @returns {IllustAdapter}
   */
  static create(url) {
    return new IllustAdapter(url);
  }

  /**
   * Parse the illustration id out from target url
   * @returns {string}
   * @throws {RuntimeError}
   */
  parseIllustId() {
    let regexes = [/illust_id=(\d+)/, /artworks\/(\d+)/];

    for (let regex of regexes) {
      let matches = this.url.match(regex);

      if (matches) {
        return matches[1];
      }
    }

    throw new RuntimeError(`Can't parse the illust id out. url: ${this.url}`);
  }

  getIllustUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}`;
  }

  /**
   * Make context standard
   * @param {object} context
   * @returns {object}
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
   * Load illust context
   * @param {string} illustId
   * @return {Promise.<string,Error>}
   */
   loadIllustContext(illustId) {
    return new Promise((resolve, reject) => {
      let request = new Request(this.getIllustUrl(illustId), { method: 'GET' });

      request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json && json.body) {
          this.context = this.standardContext(json.body);

          /**
           * Append current url to context
           */
          this.context.targetUrl = this.url;

          resolve();
        }
      });

      request.addListener('onerror', error => {
        reject(error);
      })

      request.send();
    });
  }

  getIllustPagesUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}/pages`;
  }

  loadIllustPagesContext(illustId) {
    return new Promise((resolve, reject) => {
      let request = new Request(this.getIllustPagesUrl(illustId), { method: 'GET' });

      request.addListener('onload', data => {
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

      request.addListener('onerror', error => {
        reject(error);
      });

      request.send();
    });
  }

  /**
   * Get ugoira meta url
   * @param {string} id
   * @returns {string}
   */
  getUgoiraMetaUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}/ugoira_meta`;
  }

  /**
   *
   * @param {string} illustId
   * @return {Promise.<any.Error>}
   */
  loadUgoiraMetaContext(illustId) {
    return new Promise((resolve, reject) => {
      let request = new Request(this.getUgoiraMetaUrl(illustId), { method: 'GET' });

      request.addListener('onload', data => {
        let textDecoder = new TextDecoder();
        let json = JSON.parse(textDecoder.decode(data));

        if (json.error) {
          reject();
          return;
        }

        this.context.illustSrc = json.body.src;
        this.context.illustOriginalSrc = json.body.originalSrc;
        this.context.illustFrames = json.body.frames;
        this.context.illustMimeType = json.body.mime_type;
        this.context.__metadata = this.rawContext;

        let duration = 0

        this.context.illustFrames.forEach(function (frame) {
          duration += frame.delay;
        });

        this.context.illustDuration = duration;

        resolve();
      });

      request.send();
    });
  }

  createIllustDownloadTask(options) {
    return IllustDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      selectedIndex: options.selectedIndex,
      renameRule:  app().settings.illustRenameRule,
      context: this.context,
    });
  }

  createMangaDownloadTask() {
    return MangaDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      renameRule: app().settings.ugoiraRenameRule,
      context: this.context,
    });
  }

  createUgoiraDownloadTask() {
    return UgoiraDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      resource: this.context.illustOriginalSrc,
      frames: this.context.illustFrames,
      packAnimationJsonType: app().settings.animationJsonFormat,
      context: this.context,
    });
  }

  /**
   * Create non-options setted download task instance
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(options) {
    await this.loadIllustContext(this.parseIllustId(this.url));

    if (this.context.illustType === IllustAdapter.ILLUST_TYPE) {
      await this.loadIllustPagesContext(this.context.id);
      return this.createIllustDownloadTask(options);
    } else if (this.context.illustType === IllustAdapter.MANGA_TYPE) {
      await this.loadIllustPagesContext(this.context.id);
      return this.createMangaDownloadTask();
    } else if (this.context.illustType === IllustAdapter.UGOIRA_TYPE) {
      await this.loadUgoiraMetaContext(this.context.id);
      return this.createUgoiraDownloadTask(options);
    }
  }
}

export default IllustAdapter;
