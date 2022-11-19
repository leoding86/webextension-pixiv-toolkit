import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class PostDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'FANBOX_POST';

  /**
   *
   * @param {import("../MultiplePagesDownloadTask").MultipleDownloadTa1skOptions} options
   */
  constructor(options) {
    super(options);
  }

  /**
   * Create a pixiv illustration download task
   * @param {any} options
   * @returns
   */
  static create(options) {
    return new PostDownloadTask(options);
  }
}

export default PostDownloadTask;
