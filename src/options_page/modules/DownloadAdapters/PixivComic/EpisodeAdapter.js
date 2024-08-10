import GlobalSettings from "@/modules/GlobalSettings";
import {
  PixivComicEpisodeDownloadTask as EpisodeDownloadTask
} from "@/options_page/modules/DownloadTasks";
import { PixivComicEpisodeParser } from "@/modules/Parser";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import AbstractResource from "@/modules/PageResource/AbstractResource";

class EpisodeAdapter {
  /**
   * @type {string} yek
   */
  yek = 'm' + 'A' + 't' + 'W' + '1' + 'X' + '8' + 'S' + 'z' + 'G' + 'S' + '8' + '8' + '0' + 'f' + 's' + 'j' + 'E' + 'X' + 'l' + 'M' + '7' + '3' + 'Q' + 'p' + 'S' + '1' + 'i' + '4' + 'k' + 'U' + 'M' + 'B' + 'h' + 'y' + 'h' + 'd' + 'a' + 'Y' + 'y' + 'S' + 'k' + '8' + 'n' + 'W' + 'z' + '5' + '3' + '3' + 'n' + 'r' + 'E' + 'u' + 'n' + 'a' + 'S' + 'p' + 'l' + 'g' + '6' + '3' + 'f' + 'z' + 'T';

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
    this.settings = GlobalSettings();
  }

  /**
   * Create a adapter instance
   * @param {string} url Target page url
   * @returns {EpisodeAdapter}
   */
  static create(url) {
    return new EpisodeAdapter(url);
  }

  /**
   * Create non-options setted download task instance
   * @param {AbstractResource} resource
   * @param {Object} options
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(resource, options) {
    this.context = resource.getContext();
    this.context.targetUrl = this.url;

    return EpisodeDownloadTask.create({
      id: 'pixiv_comic:episode:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      pageNumberStartWithOne: this.settings.pixivComicEpisodePageNumberStartWithOne === -2 ?
                              this.settings.globalTaskPageNumberStartWithOne :
                              this.settings.pixivComicEpisodePageNumberStartWithOne,
      pageNumberLength: this.settings.pixivComicEpisodePageNumberLength === -2 ?
                        this.settings.globalTaskPageNumberStartWithOne :
                        this.settings.pixivComicEpisodePageNumberLength,
      renameRule: this.settings.pixivComicEpisodeRenameRule,
      renameImageRule: this.settings.pixivComicEpisodeRenameImageRule,
      context: this.context
    });
  }
}

export default EpisodeAdapter;
