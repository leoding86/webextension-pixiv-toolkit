import GlobalSettings from "@/modules/GlobalSettings";
import {
  PixivNovelDownloadTask as NovelDownloadTask
} from "@/options_page/modules/DownloadTasks";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import AbstractResource from "@/modules/PageResource/AbstractResource";

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
   * @param {AbstractResource} resource
   * @param {Object} options
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(resource, options) {
    this.context = resource.getContext();

    /**
     * Append current url to context
     */
    this.context.targetUrl = this.url;

    return NovelDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      renameRule: GlobalSettings().novelRenameRule,
      includeDescription: GlobalSettings().novelIncludeDescription,
      context: this.context,
      bookType: options.bookType,
    });
  }
}

export default NovelAdapter;
