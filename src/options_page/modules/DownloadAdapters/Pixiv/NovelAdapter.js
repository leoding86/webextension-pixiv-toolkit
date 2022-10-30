import { app } from "@/options_page/DownloadsApplication";
import { RuntimeError } from "@/errors";
import {
  NovelDownloadTask
} from "@/options_page/modules/DownloadTasks";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import DateFormatter from "@/modules/Util/DateFormatter";
import Request from "@/modules/Net/Request";

class NovelAdapter {
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
   * @returns {NovelAdapter}
   */
  static create(url) {
    return new NovelAdapter(url);
  }

  /**
   * Parse the novel id out from target url
   * @returns {string}
   * @throws {RuntimeError}
   */
  parseNoveltId() {
    let regexes = [/novel\/show\.php\?id=(\d+)/];

    for (let regex of regexes) {
      let matches = this.url.match(regex);

      if (matches) {
        return matches[1];
      }
    }

    throw new RuntimeError(`Can't parse the novel id out. url: ${this.url}`);
  }

  getNovelUrl(id) {
    return `https://www.pixiv.net/ajax/novel/${id}`;
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
      this.novelContext.seriesId = context.seriesNavData.seriesId;
      this.novelContext.seriesTitle = context.seriesNavData.title;
      this.novelContext.seriesOrder = context.seriesNavData.order;
    }
  }

  /**
   * Load novel context
   * @param {string} novelId
   * @return {Promise.<string,Error>}
   */
   loadNovelContext(novelId) {
    return new Promise((resolve, reject) => {
      let request = new Request(this.getNovelUrl(novelId), { method: 'GET' });

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

  /**
   * Create non-options setted download task instance
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(options) {
    await this.loadNovelContext(this.parseNoveltId(this.url));

    return NovelDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      renameRule: app().settings.novelRenameRule,
      context: this.context,
      bookType: options.bookType,
    });
  }
}

export default NovelAdapter;
