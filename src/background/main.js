import Browser from '@/modules/Browser/Browser';
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/BackgroundPort';
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/BackgroundPort';
import { Updater } from '@/modules/Util';
import defaultSettings from '@/config/default';
import updateSettings from '@/config/update';

const browser = window.browser = Browser.getBrowser();

function Main() {
  this.items = null;
  this.logs = [];
  this.logsMax = 200;
  this.ports = {};
}

Main.prototype = {
  getPorts: function() {
    let ports = {};

    ports[IllustHistoryPort.portName] = IllustHistoryPort;
    ports[DownloadRecordPort.portName] = DownloadRecordPort;

    return ports;
  },

  run: function () {
    browser.storage.local.get(null, items => {
      this.items = items;
      this.ports = this.getPorts();
      this.update();
      this.listenStorageChanged();
      this.listenMessage();
      this.listenPortConnect();
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
    let opt_onBeforeSendHeaders_extraInfoSpec = [
      browser.webRequest.OnBeforeSendHeadersOptions.BLOCKING || "blocking",
      browser.webRequest.OnBeforeSendHeadersOptions.REQUEST_HEADERS || "requestHeaders"
    ];

    let opt_onHeadersReceived_extraInfoSpec = [
      browser.webRequest.OnHeadersReceivedOptions.BLOCKING || 'blocking',
      browser.webRequest.OnHeadersReceivedOptions.RESPONSE_HEADERS || 'responseHeaders',
    ];

    /**
     * Firefox has not enumeration EXTRA_HEADERS on OnBeforeSendHeadersOptions and OnHeadersReceivedOptions
     */
    if (browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS) {
      opt_onBeforeSendHeaders_extraInfoSpec.push(browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS);
    }

    if (browser.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS) {
      opt_onHeadersReceived_extraInfoSpec.push(browser.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS);
    }

    let savePattern = /^https:\/\/(www\.)[pixiv|fanbox]/;
    let filter = [
      "*://*.pixiv.net/*",
      "*://*.pximg.net/*",
      "*://*.techorus-cdn.com/*",
      "*://*.fanbox.cc/*"
    ];

    browser.webRequest.onBeforeSendHeaders.addListener(details => {
      if (details.type === 'xmlhttprequest') {
        let hasOriginHeader = false;
        let hasReferer = false;

        details.requestHeaders.forEach((header, i) => {
          let headerName = header.name.toLowerCase();

          if (headerName === 'referer') {
            hasReferer = true;

            if (details.url.indexOf('i.pximg.net') > -1 && !savePattern.test(header.value)) {
              details.requestHeaders[i].value = 'https://www.pixiv.net/';
            }
          } else if (headerName === 'origin') {
            hasOriginHeader = true;
          }
        });

        if (details.url.indexOf('api.fanbox.cc') > -1) {
          if (!hasOriginHeader) {
            details.requestHeaders.push({
              name: 'Origin',
              value: details.initiator ? details.initiator : 'https://www.fanbox.cc'
            });
          }
        }

        if (!hasReferer) {
          details.requestHeaders.push({
            name: 'referer',
            value: 'https://www.pixiv.net/'
          });
        }

        return { requestHeaders: details.requestHeaders }
      }
    }, {
      urls: filter
    }, opt_onBeforeSendHeaders_extraInfoSpec);

    browser.webRequest.onHeadersReceived.addListener(details => {
      if (details.type === 'xmlhttprequest') {
        details.responseHeaders.forEach((header, i) => {
          if (header.name.toLowerCase() === 'access-control-allow-origin') {
            details.requestHeaders.splice(i, 1);
          }
        });

        let accessControlAllowOrigin = '';

        if (details.frameId === 0 && /^https:\/\/[^.]+\.fanbox\.cc/.test(details.initiator)) {
          accessControlAllowOrigin = details.initiator;
          details.responseHeaders.push({
            name: 'Access-Control-Allow-Credentials',
            value: 'true'
          });
        } else {
          accessControlAllowOrigin = '*';
        }

        details.responseHeaders.push({
          name: 'Access-Control-Allow-Origin',
          value: accessControlAllowOrigin
        });

        return { responseHeaders: details.responseHeaders };
      }
    }, {
      urls: filter
    }, opt_onHeadersReceived_extraInfoSpec);
  },

  callMessageAction: function (action, args) {
    let methodName = action + 'Action';

    if (typeof this[methodName] === 'function') {
      this[methodName].call(this, args);
    }
  },

  listenStorageChanged: function () {
    let self = this;

    browser.storage.onChanged.addListener(function (changes, areaName) {
      for (let key in changes) {
        self.items[key] = changes[key].newValue;
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
    let self = this;

    browser.runtime.onConnect.addListener(port => {
      if (port.name && self.ports[port.name]) {
        self.ports[port.name].getInstance(port);
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
    if (args.message.options.arrayBuffer) {
      args.message.options.url = URL.createObjectURL(new Blob([args.message.options.arrayBuffer], { type: 'text/plain' }));
      delete args.message.options.arrayBuffer;
    }

    browser.downloads.download(args.message.options, function (downloadId) {
      if (!!args.sendResponse && typeof args.sendResponse === 'function') {
        args.sendResponse(downloadId);
      }
    });

    // args.message.options.url.indexOf('blob') === 0 && URL.revokeObjectURL(args.message.options.url);
  },

  updateDownloadedStatAction: function (args) {
    let type = args.message.args;
    let key = '';

    switch (type) {
      case 'ugoira':
        key = 'statUgoiraDownloaded';
        break;
      case 'illust':
        key = 'statIllustDownloaded';
        break;
      case 'manga':
        key = 'statMangaDownloaded';
        break;
      case 'novel':
        key = 'statNovelDownloaded';
        break;
      default:
        throw 'Unkown stat downloaded type "' + type + '"';
    }

    let data = {};
    data[key] = typeof this.items[key] === 'number' ? ++this.items[key] : 0;

    browser.storage.local.set(data);
  },

  /**
   * Record logs
   * @param {Object} args
   * @param {String} args.message
   * @param {String} args.source
   * @param {Number} args.lineno
   * @param {Number} args.colno
   * @param {Error} args.error
   */
  recordLogAction: function (args) {
    if (this.logs.length >= 200) {
      this.logs.pop();
    }

    let errorMsg = args.error
      ? args.error.message
        ? args.error.message : args.message
      : args.message;

    this.logs.push(errorMsg);
  },

  update: function () {
    let manifest = browser.runtime.getManifest();
    let version = manifest.version;

    browser.storage.local.get(null, function (items) {
      var updater = new Updater(items, defaultSettings);

      if (updater.isNewer(version)) {
        updater.mergeSettings({
          version: version,
          showUpdateChangeLog: false,
          importantNoticeDisplayed: updateSettings.importantNoticeDisplayed || true
        }).then(() => {
          /**
           * Attach a badge with text 'NEW'
           */
          browser.browserAction.setBadgeText({
            text: 'NEW'
          });

          browser.browserAction.setBadgeBackgroundColor({
            color: '#FF0000'
          });
        });
      }
    });
  }
}

const main = window.$extension = new Main();
main.run();
