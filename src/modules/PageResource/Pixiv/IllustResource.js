import AbstractResource from "../AbstractResource";

/**
 * @typedef ContextType
 * @property {string} id
 * @property {string} title
 * @property {string} cover
 * @property {string} comment
 * @property {string} description
 * @property {string} createDate
 * @property {string} uploadDate
 * @property {string} type
 * @property {number} bookmarkCount
 * @property {number} likeCount
 * @property {number} responseCount
 * @property {number} viewCount
 * @property {string} year
 * @property {string} month
 * @property {string} day
 * @property {string} r
 * @property {string[]} urls
 * @property {string} userAccount
 * @property {string} userId
 * @property {string} userName
 * @property {string} illustType
 * @property {string[]?} pages The property isn't exists if the illust is ugoira
 * @property {string?} illustSrc Only for ugoiraA
 * @property {string?} illustOriginalSrc Only for ugoira
 * @property {{delay: number, file: string}[]?} illustFrames Only for ugoira
 * @property {string?} illustMimeType Only for ugoira
 * @property {number?} illustDuration Only for ugoira
 * @property {number?} totalPages The property isn't exists if the illust is ugoira
 * @property {number?} pageNum This is a temprory property when create filename
 * @property {Object} __metadata
 *
 * @class
 */
class IllustResource extends AbstractResource {
  /**
   * @type {string}
   */
  static __PACK_NAME__ = 'ILLUST';

  /**
   * @type {number}
   */
  static ILLUST_TYPE = 0;

  /**
   * @type {number}
   */
  static MANGA_TYPE = 1;

  /**
   * @type {number}
   */
  static UGOIRA_TYPE = 2;

  /**
   *
   * @param {ContextType} context
   */
  constructor(context) {
    super(context);
  }

  /**
   *
   * @param {Object} context
   * @returns {IllustResource}
   */
  static create(context) {
    return new IllustResource(context);
  }

  /**
   * @inheritdoc
   * @override
   * @returns {string}
   */
  getUid() {
    return 'pixiv_illust:' + this.getId();
  }

  isIllust() {
    return this.context.illustType === IllustResource.ILLUST_TYPE;
  }

  isManga() {
    return this.context.illustType === IllustResource.MANGA_TYPE;
  }

  isUgoira() {
    return this.context.illustType === IllustResource.UGOIRA_TYPE;
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  getType() {
    if (this.isIllust()) {
      return 'pixiv_illust';
    } else if (this.isManga()) {
      return 'pixiv_manga';
    } else if (this.isUgoira()) {
      return 'pixiv_ugoira';
    } else {
      return 'pixiv_illust';
    }
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  packName() {
    return IllustResource.__PACK_NAME__;
  }

  /**
   *
   * @param {'apng'|'gif'|'mp4'|'webm'} [convertType]
   * @returns
   */
  getDownloadTaskId(convertType) {
    if (this.isUgoira()) {
      return this.getUid() + ':' + (convertType || 'custom').toLowerCase();
    } else {
      return this.getUid();
    }
  }
}

export default IllustResource;
