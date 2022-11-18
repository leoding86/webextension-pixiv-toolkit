import { app } from "@/options_page/DownloadsApplication";
import {
  PixivNovelDownloadTask as NovelDownloadTask
} from "@/options_page/modules/DownloadTasks";
import { PixivNovelParser } from "@/modules/Parser";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";

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
   * Create non-options setted download task instance
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(options) {
    let novelParser = PixivNovelParser.create(this.url);

    await novelParser.parseContext();
    this.context = novelParser.getContext();

    /**
     * Append current url to context
     */
    this.context.targetUrl = this.url;

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
