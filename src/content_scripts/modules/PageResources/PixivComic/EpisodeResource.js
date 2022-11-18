import AbstractResource from "../AbstractResource";

class EpisodeResource extends AbstractResource {
  /**
   *
   * @param {Object} context
   */
  constructor(context) {
    super(context);
  }

  /**
   *
   * @param {Object} context
   * @returns {EpisodeResource}
   */
  static create(context) {
    return new EpisodeResource(context);
  }

  /**
   * @returns {string}
   */
  getUid() {
    return 'pixiv_comic_episode:' + this.getId();
  }
}

export default EpisodeResource;
