import { app } from "@/options_page/DownloadsApplication";
import {
  PixivIllustDownloadTask as IllustDownloadTask,
  PixivMangaDownloadTask as MangaDownloadTask,
  PixivUgoiraDownloadTask as UgoiraDownloadTask
} from "@/options_page/modules/DownloadTasks";
import {
  PixivIllustParser
} from "@/modules/Parser";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";

class IllustAdapter {
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

  createIllustDownloadTask(options) {
    return IllustDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      selectedIndexes: options.selectedIndexes,
      renameRule:  app().settings.illustRenameRule,
      context: this.context,
    });
  }

  createMangaDownloadTask() {
    return MangaDownloadTask.create({
      id: 'pixiv:illust:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      renameRule: app().settings.mangaRenameRule,
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
      renameRule: app().settings.ugoiraRnameRule,
      context: this.context,
    });
  }

  /**
   * Create non-options setted download task instance
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(options) {
    let illustParser = new PixivIllustParser(this.url);

    await illustParser.parseContext();

    this.context = illustParser.getContext();

    /**
     * Append current url to context
     */
    this.context.targetUrl = this.url;

    if (illustParser.isIllust()) {
      return this.createIllustDownloadTask(options);
    } else if (illustParser.isManga()) {
      return this.createMangaDownloadTask();
    } else if (illustParser.isUgoira()) {
      return this.createUgoiraDownloadTask(options);
    }
  }
}

export default IllustAdapter;
