import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class MangaDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_MANGA';

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
    return new MangaDownloadTask(options);
  }

  /**
   * @override
   * @returns {true}
   */
  canSaveInfo() {
    return true;
  }
}

export default MangaDownloadTask;
