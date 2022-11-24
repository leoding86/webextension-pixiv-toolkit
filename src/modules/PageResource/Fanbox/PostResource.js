import AbstractResource from "../AbstractResource";

class PostResource extends AbstractResource {
  /**
   * @type {string}
   */
   static __PACK_NAME__ = 'FANBOX_POST';

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
   * @returns {PostResource}
   */
  static create(context) {
    return new PostResource(context);
  }

  /**
   * @returns {string}
   */
  getUid() {
    return 'fanbox_post:' + this.getId();
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  getType() {
    return 'fanbox_post';
  }

  /**
   * @inheritdoc
   * @returns {string}
   */
  packName() {
    return PostResource.__PACK_NAME__;
  }
}

export default PostResource;
