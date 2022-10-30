import browser from "@/modules/Extension/browser";
import Application from "./Application";

class Bootstrap {
  static initializeApplication(application) {
    Bootstrap.emitBeforeBoot(application);

    Bootstrap.bindEvents(application);
  }

  static bindableRuntimeEvents = [
    'onConnect', 'onInstalled', 'onMessage', 'onRestartRequired',
    'onStartup', 'onSuspend', 'onSuspendCanceled', 'onUpdateAvailable',
  ];

  static bindEvents(bindableInstance) {
    Bootstrap.bindableRuntimeEvents.forEach(event => {
      if (typeof bindableInstance[event] === 'function') {
        console.error(event);
        browser.runtime[event].addListener(function() {
          console.error(arguments);
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

  static emitBeforeBoot(application) {
    if (typeof application.onBeforeBoot === 'function') {
      application.onBeforeBoot.call(application);
    }
  }

  static boot(application) {
    application.onBooted.call(application);
  }
}

const application = Application.createApp();

Bootstrap.initializeApplication(application);

self.oninstall = () => {
  importScripts(
    browser.runtime.getURL('lib/pouchdb.min.js'),
    browser.runtime.getURL('lib/pouchdb.find.min.js')
  );

  Bootstrap.boot(application);

  self.application = application;
};
