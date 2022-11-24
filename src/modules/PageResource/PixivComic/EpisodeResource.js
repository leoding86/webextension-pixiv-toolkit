import AbstractResource from "../AbstractResource";

/**
 * @typedef ContextType
 * @property {string} id
 * @property {string} title
 * @property {string} subTitle
 * @property {string} cover
 * @property {string} numberingTitle
 * @property {string} workId
 * @property {string} workTitle
 * @property {string} type
 * @property {string[]} pages
 * @property {number} totalPages
 *
 * @class
 */
class EpisodeResource extends AbstractResource {
  /**
   * @type {string}
   */
  static __PACK_NAME__ = 'PIXIV_COMIC_EPISODE';

  /**
   *
   * @param {ContextType} context
   */
  constructor(context) {
    super(context);
  }

  /**
   *
   * @param {ContextType} context
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

  /**
   * @inheritdoc
   * @returns {string}
   */
  getType() {
    return 'pixiv_comic_episode';
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  packName() {
    return EpisodeResource.__PACK_NAME__;
  }
}

export default EpisodeResource;
