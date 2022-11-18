import AbstractResource from "../AbstractResource";

class PostResource extends AbstractResource {
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
}

export default PostResource;
