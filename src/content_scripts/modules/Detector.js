import Adapter from '@/content_scripts/modules/Adapter';
import { RuntimeError } from '@/errors';
import Event from '@/modules/Event';

class Detector extends Event {
  /**
   * @type {string}
   */
  currentUrl;

  /**
   * @constructor
   */
  constructor() {
    this.adapter = new Adapter();
  }

  /**
   * Observe url changes
   */
  observeUrl() {
    let observer = new MutationObserver((mutationsList, observer) => {
      /**
       * If different page has been loaded, app should re-reject the page
       */
      if (window.location.href !== vm.currentUrl) {
        /**
         * Fire urlchange event
         */
        this.dispatch('urlchange', [window.location.href, this.currentUrl]);
        this.currentUrl = window.location.href;
      }
    });

    observer.observe(document.querySelector('body'), {
      attributes: true,
      childList: true,
      subtree: true
    });

    this.currentUrl = window.location.href;
  }

  /**
   *
   * @param {string} url
   * @throws {RuntimeError}
   */
  async parse(url) {
    let context = await this.adapter.getContext(url);

    if (!context) {
      throw new RuntimeError(`Invalid page. url: ${url}`);
    }

    this.dispatch('parse', [context]);
  }
}

export default Detector;
