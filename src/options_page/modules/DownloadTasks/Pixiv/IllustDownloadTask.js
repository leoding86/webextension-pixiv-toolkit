import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class IllustDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_ILLUST';

  /**
   *
   * @param {import("../MultiplePagesDownloadTask").MultipleDownloadTaskOptions} options
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
    return new IllustDownloadTask(options);
  }
}

export default IllustDownloadTask;
