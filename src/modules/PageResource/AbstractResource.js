import NotImplementedError from "@/errors/NotImplementedError";

/**
 * Resource interface
 */
class AbstractResource {
  /**
   * @type {string}
   */
  static __PACK_NAME__;

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
   * Unpacking instance, using Factory to re-create instance
   * @returns {Object}
   */
  unpack() {
    let obj = this.context;
    obj.__PACK_NAME__ = this.packName();
    return obj
  }

  /**
   * Get the resource pack name
   * @throws {NotImplementedError}
   */
  packName() {
    throw new NotImplementedError();
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

  /**
   *
   * @returns {string}
   */
  getUserName() {
    return this.context.userName || '';
  }

  /**
   *
   * @returns {string}
   */
  getType() {
    return '';
  }

  /**
   * @returns {string[]}
   */
  getPages() {
    return this.context.pages ? this.context.pages : null;
  }

  getPageResolver() {
    return this.context.pageResolver;
  }

  getDownloadTaskId() {
    return this.getUid();
  }
}

export default AbstractResource;
