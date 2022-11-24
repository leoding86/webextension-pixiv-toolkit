import AbstractResource from "../AbstractResource";

/**
 * @typedef ContextType
 * @property {string} userName
 * @property {string} userId
 * @property {string} r
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} cover
 * @property {string[]} sections
 * @property {string} createDate
 * @property {string} uploadDate
 * @property {string} type
 * @property {number} bookmarkCount
 * @property {number} likeCount
 * @property {number} viewCount
 * @property {string} year
 * @property {string} month
 * @property {string} day
 *
 * @class
 */
class NovelResource extends AbstractResource {
  /**
   * @type {string}
   */
  static __PACK_NAME__ = 'NOVEL';

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
   * @returns {NovelResource}
   */
  static create(context) {
    return new NovelResource(context);
  }

  /**
   * @returns {string}
   */
  getUid() {
    return 'pixiv_novel:' + this.getId();
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  getType() {
    return 'pixiv_novel';
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  packName() {
    return NovelResource.__PACK_NAME__;
  }
}

export default NovelResource;
