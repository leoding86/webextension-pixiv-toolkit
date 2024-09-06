import GlobalSettings from "@/modules/GlobalSettings";
import { FanboxPostDownloadTask as PostDownloadTask } from "@/options_page/modules/DownloadTasks";
import { FanboxPostParser } from "@/modules/Parser";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";
import AbstractResource from "@/modules/PageResource/AbstractResource";

class PostAdapter {
  /**
   * @type {string} Target page url
   */
  url;

  /**
   * @type {object} Target context data
   */
  context;

  /**
   * @type {string}
   */
  postId;

  /**
   * @type {Object}
   */
  settings;

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
   * @returns {PostAdapter}
   */
  static create(url) {
    return new PostAdapter(url);
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

    return PostDownloadTask.create({
      id: resource.getUid(),
      url: this.url,
      pages: this.context.pages,
      selectedIndexes: options.selectedIndexes,
      renameRule: this.settings.fanboxPostRenameRule,
      renameImageRule: this.settings.fanboxPostRenameImageRule,
      pageNumberStartWithOne: this.settings.fanboxPostPageNumberStartWithOne === -2 ?
                              this.settings.globalTaskPageNumberStartWithOne :
                              this.settings.fanboxPostPageNumberStartWithOne,
      pageNumberLength: this.settings.fanboxPostPageNumberLength === -2 ?
                        this.settings.globalTaskPageNumberLength :
                        this.settings.fanboxPostPageNumberLength,
      context: this.context
    });
  }
}

export default PostAdapter;
