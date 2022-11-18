import AbstractResource from "../AbstractResource";

class IllustResource extends AbstractResource {
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
   * @returns {IllustResource}
   */
  static create(context) {
    return new IllustResource(context);
  }

  /**
   * @returns {string}
   */
  getUid() {
    return 'pixiv_illust:' + this.getId();
  }
}

export default IllustResource;
