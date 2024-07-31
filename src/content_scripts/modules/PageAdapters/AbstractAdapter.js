import NotImplementedError from "@/errors/NotImplementedError";

/**
 * @class
 * @abstract
 */
class AbstractAdapter {
  /**
   * @type {string}
   */
  url;

  /**
   * @type {*}
   */
  context;

  /**
   *
   * @param {string} url
   */
  constructor(url) {
    this.url = url;
    this.context = {};
  }
}

export default AbstractAdapter;
