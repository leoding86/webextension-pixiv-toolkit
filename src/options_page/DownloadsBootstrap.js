import browser from "@/modules/Extension/browser";
import Application from "./DownloadsApplication";

class DownloadsBootstrap {
  static __main__() {
    const application = Application.createApp();

    DownloadsBootstrap.bindEvents(application);

    DownloadsBootstrap.initialApplication(application);

    application.onBooted.call(application);
  }

  static bindableRuntimeEvents = [
    'onMessage'
  ];

  static bindEvents(bindableInstance) {
    DownloadsBootstrap.bindableRuntimeEvents.forEach(event => {
      if (typeof bindableInstance[event] === 'function') {
        browser.runtime[event].addListener(function() {
          console.log(arguments);
          bindableInstance[event].apply(bindableInstance, arguments);

          /**
           * Prevent message port be closed early.
           */
          if (event === 'onMessage') {
            return true;
          }
        });
      }
    });
  }

  static initialApplication(application) {
    if (typeof application.onBeforeBoot === 'function') {
      application.onBeforeBoot.call(application);
    }
  }
}

export default DownloadsBootstrap;
