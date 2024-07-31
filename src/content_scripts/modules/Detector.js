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
    super();
  }

  /**
   * Observe url changes
   */
  observeUrl() {
    let observer = new MutationObserver((mutationsList, observer) => {
      /**
       * If different page has been loaded, app should re-reject the page
       */
      if (window.location.href !== this.currentUrl) {
        /**
         * Fire urlchange event
         */
        this.dispatch('urlchange', [window.location.href, this.currentUrl]);
        this.currentUrl = window.location.href;
      }
    });

    observer.observe(document.querySelector('body'), {
      childList: true,
      subtree: true,
      attributes: true,
    });

    this.currentUrl = window.location.href;
  }
}

export default Detector;
