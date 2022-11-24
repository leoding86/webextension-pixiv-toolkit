import MultipleDownloadTask from "../MultiplePagesDownloadTask";

/**
 * @class
 */
class EpisodeDownloadTask extends MultipleDownloadTask {
  /**
   * @inheritdoc
   */
  type = 'PIXIV_COMIC_EPISODE';

  /**
   *
   * @param {import("../MultiplePagesDownloadTask").MultipleDownloadTaskOptions} options
   */
  constructor(options) {
    super(options);
  }

  /**
   * Create a pixiv illustration download task
   * @param {import("../MultiplePagesDownloadTask").MultipleDownloadTaskOptions} options
   * @returns
   */
  static create(options) {
    return new EpisodeDownloadTask(options);
  }
}

export default EpisodeDownloadTask;
