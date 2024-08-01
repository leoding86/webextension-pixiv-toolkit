import { app } from "@/options_page/DownloadsApplication";
import {
  PixivIllustDownloadTask as IllustDownloadTask,
  PixivMangaDownloadTask as MangaDownloadTask,
  PixivUgoiraDownloadTask as UgoiraDownloadTask
} from "@/options_page/modules/DownloadTasks";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import AbstractResource from "@/modules/PageResource/AbstractResource";
import IllustResource from "@/modules/PageResource/Pixiv/IllustResource";

class IllustAdapter {
  /**
   * @type {Object}
   */
  settings;

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
    this.settings = app().settings;
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
   * @param {AbstractResource} resource
   * @param {Object} options
   * @returns {IllustDownloadTask}
   */
  createIllustDownloadTask(resource, options) {
    return IllustDownloadTask.create({
      id: resource.getUid(),
      url: this.url,
      pages: this.context.pages,
      selectedIndexes: options.selectedIndexes,
      renameRule:  this.settings.illustRenameRule,
      pageNumberStartWithOne: this.settings.illustrationPageNumberStartWithOne === -2 ?
                              this.settings.globalTaskPageNumberStartWithOne :
                              this.settings.illustrationPageNumberStartWithOne,
      pageNumberLength: this.settings.illustrationPageNumberLength === -2 ?
                        this.settings.globalTaskPageNumberLength :
                        this.settings.illustrationPageNumberLength,
      context: this.context,
    });
  }

  /**
   * @param {AbstractResource} resource
   * @param {Object} options
   * @returns {MangaDownloadTask}
   */
  createMangaDownloadTask(resource, options) {
    return MangaDownloadTask.create({
      id: resource.getUid(),
      url: this.url,
      pages: this.context.pages,
      selectedIndexes: options.selectedIndexes,
      renameRule: this.settings.mangaRenameRule,
      pageNumberStartWithOne: this.settings.mangaPageNumberStartWithOne === -2 ?
                              this.settings.globalTaskPageNumberStartWithOne :
                              this.settings.mangaPageNumberStartWithOne,
      pageNumberLength: this.settings.mangaPageNumberLength === -2 ?
                        this.settings.globalTaskPageNumberLength :
                        this.settings.mangaPageNumberLength,
      context: this.context,
    });
  }

  /**
   * @param {AbstractResource} resource
   * @returns {UgoiraDownloadTask}
   */
  createUgoiraDownloadTask(resource) {
    return UgoiraDownloadTask.create({
      id: resource.getUid(),
      url: this.url,
      resource: this.context.illustOriginalSrc,
      frames: this.context.illustFrames,
      packAnimationJsonType: this.settings.animationJsonFormat,
      renameRule: this.settings.ugoiraRenameRule,
      customFFmpegCommand: this.settings.ugoiraCustomFFmpegCommand,
      context: this.context,
    });
  }

  /**
   * Create non-options setted download task instance
   * @param {IllustResource} resource
   * @param {Object} options
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(resource, options) {
    this.context = resource.getContext();

    /**
     * Append current url to context
     */
    this.context.targetUrl = this.url;

    if (resource.isIllust()) {
      return this.createIllustDownloadTask(resource, options);
    } else if (resource.isManga()) {
      return this.createMangaDownloadTask(resource, options);
    } else if (resource.isUgoira()) {
      return this.createUgoiraDownloadTask(resource, options);
    }
  }
}

export default IllustAdapter;
