import IllustDownloadTask from "./IllustDownloadTask";

/**
 * @typedef IllustDownloadTaskOptions
 * @property {string} id
 * @property {string[]} pages
 * @property {number[]} selectedIndexes
 * @property {string} renameRule
 * @property {any} context
 *
 * @class
 */
class MangaDownloadTask extends IllustDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_MANGA';

  /**
   *
   * @param {MangaDownloadTaskOptions} options
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
}

export default MangaDownloadTask;
