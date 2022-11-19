import { app } from "@/options_page/DownloadsApplication";
import { FanboxPostDownloadTask as PostDownloadTask } from "@/options_page/modules/DownloadTasks";
import { FanboxPostParser } from "@/modules/Parser";
import AbstractDownloadTask from "../../DownloadTasks/AbstractDownloadTask";

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
   * @constructor
   * @param {string} url Target page url
   */
  constructor(url) {
    this.url = url;
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
   * @returns {AbstractDownloadTask}
   */
  async createDownloadTask(options) {
    let postParser = new FanboxPostParser();

    await postParser.parseContext();
    this.context = postParser.getContext();

    /**
     * Append current url to context
     */
    this.context.targetUrl = this.url;

    return PostDownloadTask.create({
      id: 'fanbox_post:' + this.context.id,
      url: this.url,
      pages: this.context.pages,
      renameRule: app().settings.fanboxPostRenameRule,
      context: this.context
    });
  }
}

export default PostAdapter;
