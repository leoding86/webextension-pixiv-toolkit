import Application from "./Application";
import browser from "@/modules/Extension/browser";
import ErrorTracker from '@/modules/ErrorTracker';

/**
 * Bootstrap
 * @class
 */
class Bootstrap {
  /**
   * Track the uncaught errors
   */
  trackError() {
    // let errorTracker = new ErrorTracker();
    // errorTracker.addListener('error', error => {
    //   console.error(error);
    //   browser.runtime.sendMessage({
    //     service: 'log:trackError',
    //     args: {
    //       error
    //     }
    //   });
    // });
  }

  /**
   * Boot the application and expose the application instance to window scope
   */
  boot() {
    this.trackError();

    window.$app = Application.app();
    window.$settings = window.$app.settings;

    browser.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener(message => {
        if (message.type === 'fetch-info' && window.$app.resource) {
          port.postMessage({ info: window.$app.resource.unpack() });
        }
      });
    });
  }
}

export default Bootstrap;
