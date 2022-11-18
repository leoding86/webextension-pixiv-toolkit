import urlFilters from "@/config/urlFilters";
import { RuntimeError } from "@/errors";

/**
 * @class
 */
class PageFilter {
  /**
   * @type {PageFilter}
   */
  static default;

  /**
   * @returns {PageFilter}
   */
  static getDefault() {
    if (!PageFilter.default) {
      PageFilter.default = new PageFilter();
    }
  }

  /**
   *
   * @param {string} url Current url
   * @returns {{url: string, type: string}}
   * @throws {RuntimeError}
   */
  getData(url) {
    for (let rule of urlFilters) {
      for (let pattern of rule.patterns) {
        if (url.test(pattern)) {
          return { url, type: rule.type };
        }
      }
    }

    throw new RuntimeError(`Invalid page. url: ${url}`);
  }
}

export default PageFilter;
