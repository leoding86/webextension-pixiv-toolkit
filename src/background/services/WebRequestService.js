import AbstractService from "./AbstractService";
import browser from "@/modules/Extension/browser";

/**
 * @deprecated
 */
class WebRequestService extends AbstractService {
  constructor() {
    super();

    this.savePattern = /^https:\/\/(www\.)[pixiv|fanbox]/;
    this.filter = [
      "*://*.pixiv.net/*",
      "*://*.pximg.net/*",
      "*://*.techorus-cdn.com/*",
      "*://*.fanbox.cc/*"
    ];

    this.overrideRequestHeaders();
    this.overrideResponseHeaders();
  }

  /**
   *
   * @param {{name: string, value: string}[]} headers
   * @param {{name: string, value: string, soft: ?boolean}[]} headersNeedOverride
   * @returns {void}
   */
  overrideHttpHeaders(headers, headersNeedOverride) {
    headersNeedOverride.forEach((headerNeedOverride, i) => {
      for (let j in headers) {
        if (headers[j].name.toLocaleLowerCase() === headerNeedOverride.name.toLocaleLowerCase()) {
          if (!headerNeedOverride.soft) {
            headers.splice(j, 1);
          } else {
            headersNeedOverride.splice(i, 1);
          }
          break;
        }
      }
    });

    headersNeedOverride.forEach(header => {
      delete header.soft;

      headers.push(header);
    });
  }

  overrideRequestHeaders() {
    let extraInfoSpec = [
      browser.webRequest.OnBeforeSendHeadersOptions.BLOCKING || "blocking",
      browser.webRequest.OnBeforeSendHeadersOptions.REQUEST_HEADERS || "requestHeaders"
    ];

    if (browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS) {
      extraInfoSpec.push(browser.webRequest.OnBeforeSendHeadersOptions.EXTRA_HEADERS);
    }

    browser.webRequest.onBeforeSendHeaders.addListener(details => {
      let requestHeadersNeedOverride = [];

      if (details.type === 'xmlhttprequest') {
        let hasOriginHeader = false;
        let hasReferer = false;

        details.requestHeaders.forEach((header, i) => {
          let headerName = header.name.toLowerCase();

          if (headerName === 'referer') {
            hasReferer = true;

            if (details.url.indexOf('i.pximg.net') > -1 && !this.savePattern.test(header.value)) {
              requestHeadersNeedOverride.push({
                name: 'referer',
                value: 'https://www.pixiv.net/'
              });
            }
          } else if (headerName === 'origin') {
            hasOriginHeader = true;
          }
        });

        if (details.url.indexOf('api.fanbox.cc') > -1) {
          if (!hasOriginHeader) {
            requestHeadersNeedOverride.push({
              name: 'Origin',
              value: details.initiator ? details.initiator : 'https://www.fanbox.cc'
            });
          }
        }

        if (!hasReferer) {
          requestHeadersNeedOverride.push({
            name: 'referer',
            value: 'https://www.pixiv.net/'
          });
        }

        if (requestHeadersNeedOverride.length > 0) {
          this.overrideHttpHeaders(details.requestHeaders, requestHeadersNeedOverride);
        }

        return { requestHeaders: details.requestHeaders }
      }
    }, {
      urls: this.filter
    }, extraInfoSpec);
  }

  overrideResponseHeaders() {
    let extraInfoSpec = [
      browser.webRequest.OnHeadersReceivedOptions.BLOCKING || 'blocking',
      browser.webRequest.OnHeadersReceivedOptions.RESPONSE_HEADERS || 'responseHeaders',
    ];

    if (browser.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS) {
      extraInfoSpec.push(browser.webRequest.OnHeadersReceivedOptions.EXTRA_HEADERS);
    }

    browser.webRequest.onHeadersReceived.addListener(details => {
      let accessControlAllowOrigin = '*',
          responseHeadersNeedOverride = [];

      if (details.type === 'xmlhttprequest') {
        if (details.frameId === 0 && /^https:\/\/[^.]+\.fanbox\.cc/.test(details.initiator)) {
          accessControlAllowOrigin = details.initiator;

          responseHeadersNeedOverride.push({
            name: 'Access-Control-Allow-Credentials',
            value: 'true'
          });
        }
      } else {
        /**
         * If the page is pixiv artwork page, enable page corss isolation.
         */
        if (this.application.settings.ugoiraConvertTool === 'ffmpeg' &&
          /^https:\/\/(www\.)?pixiv\.net\/([a-z\d\-_]*\/)?artworks/i.test(details.url)
        ) {
          responseHeadersNeedOverride.push({
            name: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          });

          responseHeadersNeedOverride.push({
            name: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          });
        }
      }

      responseHeadersNeedOverride.push({
        name: 'Cross-Origin-Resource-Policy',
        value: 'cross-origin'
      });

      responseHeadersNeedOverride.push({
        name: 'Access-Control-Allow-Origin',
        value: accessControlAllowOrigin,
        soft: true
      });

      this.overrideHttpHeaders(details.responseHeaders, responseHeadersNeedOverride);

      return { responseHeaders: details.responseHeaders };
    }, {
      urls: this.filter
    }, extraInfoSpec);
  }
}

export default WebRequestService;
