import { Updater, PackageFileReader } from '@/modules/Util';
import Browser from '@/modules/Browser/Browser';
import actions from '@/background/actions';
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort';

const browser = Browser.getBrowser();

function Main() {
  // constructor
  this.enableExtension = false;
  this.logs = [];
  this.logsMax = 200;
  this.ports = this.getPorts();
}

Main.prototype = {
  getPorts: function() {
    let ports = {};

    ports[IllustHistoryPort.port] = IllustHistoryPort;

    return ports;
  },

  run: function () {
    let self = this;

    browser.storage.local.get(null, function (items) {
      // self.enableExtension = items.enableExtension;
      self.enableExtension = true;

      self.update();
      self.bindActionButton();
      self.listenStorageChanged();
      self.listenMessage();
      self.listenPortConnect();
    });

    /**
     * Starting from Chrome 72, the following request headers are not provided and cannot be modified or removed without
     * specifying 'extraHeaders' in opt_extraInfoSpec:
     *   Accept-Language
     *   Accept-Encoding
     *   Referer
     *   Cookie
     * Starting from Chrome 72, the Set-Cookie response header is not provided and cannot be modified or removed without
     * specifying 'extraHeaders' in opt_extraInfoSpec.
     **/
    let opt_extraInfoSpec = [
      browser.webRequest.OnBeforeSendHeadersOptions.BLOCKING,
      browser.webRequest.OnBeforeSendHeadersOptions.REQUEST_HEADERS
    ];

    if (browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS) {
      opt_extraInfoSpec.push(browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS);
    }

    browser.webRequest.onBeforeSendHeaders.addListener(details => {

      for (let i = 0, l = details.requestHeaders.length; i < l; ++i) {
        if (details.requestHeaders[i].name.toLowerCase() === 'referer') {
          details.requestHeaders.splice(i, 1)
          break;
        }
      }

      details.requestHeaders.push({
        name: 'Referer',
        value: 'https://www.pixiv.net/'
      })

      return { requestHeaders: details.requestHeaders }
    }, {
      urls: [
        "*://i.pximg.net/*"
      ]
    }, opt_extraInfoSpec);
  },

  callMessageAction: function (action, args) {
    if (actions.has(action)) {
      actions.callAction(action, args)
      return
    }

    let methodName = action + 'Action';

    if (typeof this[methodName] === 'function') {
      this[methodName].call(this, args);
    }
  },

  bindActionButton: function () {
    browser.browserAction.onClicked.addListener(function () {
      browser.browserAction.getBadgeText({}, function (text) {
        let url = './options_page/index.html';

        if (text.toLowerCase() === 'new') {
          url += '#/history';

          browser.browserAction.setBadgeText({
            text: ''
          });
        }

        browser.tabs.create({
          url: browser.runtime.getURL(url)
        });
      });
    });
  },

  listenStorageChanged: function () {
    let self = this;

    browser.storage.onChanged.addListener(function (changes, areaName) {
      if (changes.enableExtension) {
        // self.enableExtension = changes.enableExtension.newValue;
      }
    });
  },

  listenMessage: function () {
    let self = this;

    browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.action) {
        // self.callMessageAction(message.action, [sender, sendResponse]);
        self.callMessageAction(message.action, {
          message: message,
          sender: sender,
          sendResponse: sendResponse
        });
      }

      /**
       * Prevent "The message port closed before a response was received" error
       */
      return true;
    });
  },

  listenPortConnect: function() {
    browser.runtime.onConnect.addListener(port => {
      if (port.name && this.ports[port.name]) {
        this.ports[port.name].getInstanceFromPort(port);
      }
    });
  },

  /**
   * Update action icon
   */
  activeIconAction: function (args) {
    browser.browserAction.setIcon({
      path: browser.runtime.getURL('./icon_active.png'),
      tabId: args.sender.tab.id
    });
  },

  deactiveIconAction: function (args) {
    browser.browserAction.setIcon({
      path: browser.runtime.getURL('./icon.png'),
      tabId: args.sender.tab.id
    });
  },

  /**
   * Request permissions and send result back
   * @param {Object} args
   */
  requestPermissionsAction: function (args) {
    browser.permissions.request(args.message.permissions, function (granted) {
      if (!!args.sendResponse && typeof args.sendResponse === 'function') {
        args.sendResponse(granted);
      }
    });
  },

  /**
   * Remove permissions and send result back
   * @param {Object} args
   */
  removePermissionsAction: function (args) {
    browser.permissions.remove(args.message.permissions, function (removed) {
      if (!!args.sendResponse && typeof args.sendResponse === 'function') {
        args.sendResponse(removed);
      }
    })
  },

  /**
   * Check if extension has permissions
   * @param {Object} args
   */
  containsPermissionsAction: function (args) {
    browser.permissions.contains(args.message.permissions, function (result) {
      if (!!args.sendResponse && typeof args.sendResponse === 'function') {
        args.sendResponse(result);
      }
    });
  },

  /**
   * Download things
   * @param {Object} args
   */
  downloadAction: function (args) {
    browser.downloads.download(args.message.options, function (downloadId) {
      if (!!args.sendResponse && typeof args.sendResponse === 'function') {
        args.sendResponse(downloadId);
      }
    });
  },

  /**
   * Record logs
   * @param {Object} args
   */
  recordLogAction: function (args) {
    // console.log(args)
  },

  update: function () {
    PackageFileReader.read('manifest.json', function (result) {
      var manifest = JSON.parse(result);
      var version = manifest.version;

      browser.storage.local.get(null, function (items) {
        var updater = new Updater(items);

        if (updater.isNewer(version)) {
          // console.log('update');
          updater.setDefaultSettings({
            version: version,
            enableExtend: false,
            enableWhenUnderSeconds: 1,
            extendDuration: 3,

            ugoiraRenameFormat: '',
            mangaRenameFormat: '',
            mangaImageRenameFormat: '',

            enableExtension: true,

            /**
             * @version 1.8.5
             * Pack ugoira frames info to zip file
             */
            enablePackUgoiraFramesInfo: true,

            /**
             * @version 1.8.8
             * Set manga page chunk
             */
            mangaPagesInChunk: 99,

            /**
             * @version 2.0.2
             */
            ugoiraGenerateAndDownload: false,
            mangaPackAndDownload: false,

            /**
             * @version 2.0.3
             */
            enableExtTakeOverDownloads: false,
            downloadRelativeLocation: null,
            showHistoryWhenUpdateCompleted: true,

            /**
             * @version 2.0.5
             */
            downloadSaveAs: false,

            /**
             * @version 2.1
             */
            featureKnown: false,

            /**
             * @version 2.2
             */
            subscribedUsers: {},

            /**
             * @version 2.3
             */
            autoActivateDownloadPanel: false
          });

          updater.removeSettings([
            'metasConfig',
            'mangaMetasConfig',
            'mangaImageNamePrefix',
            'mangaImagesMetasConfig'
          ]);

          updater.mergeSettings(function () {
            updater.updateSetting({
              version: version
            }, function () {
              // console.log('update complete. version: ' + version);
            });

            if (items.showHistoryWhenUpdateCompleted) {
              // Open change history
              browser.tabs.create({
                url: browser.runtime.getURL('./options_page/index.html') + '#/history'
              });
            } else {
              // Mark new on badge
              browser.browserAction.setBadgeText({
                text: 'NEW'
              });

              browser.browserAction.setBadgeBackgroundColor({
                color: '#FF0000'
              });
            }
          });
        }
      });
    });
  }
}

const main = new Main();
main.run();
