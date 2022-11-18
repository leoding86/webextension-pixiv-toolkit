import AbstractResource from "../AbstractResource";

class NovelResource extends AbstractResource {
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
}

export default NovelResource;
