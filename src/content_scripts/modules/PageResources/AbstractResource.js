class AbstractResource {
  /**
   * @type {Object}
   */
  context;

  /**
   *
   * @param {Object} context
   */
  constructor(context) {
    this.context = context;
  }

  /**
   *
   * @returns {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * @returns {string}
   */
  getUrl() {
    return this.context.url;
  }

  /**
   * @returns {string}
   */
  getId() {
    return this.context.id;
  }

  /**
   * @returns {string}
   */
  getUid() {
    throw new NotImplementedError();
  }

  /**
   * @returns {string}
   */
  getTitle() {
    return this.context.title;
  }

  /**
   * @returns {string}
   */
  getCover() {
    return this.context.cover;
  }

  /**
   * @returns {string}
   */
  getR() {
    return this.context.r;
  }
}

export default AbstractResource;
