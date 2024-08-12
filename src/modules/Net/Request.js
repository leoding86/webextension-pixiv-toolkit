import Event from '@/modules/Event';

const global = globalThis || window;

class Request extends Event {
  /**
   * @constructor
   */
  constructor(url, options = {}) {
    super();

    this.url = url;
    this.fetchInit = Object.assign({ readAsStream: true }, options);
    this.fetchAbortController = null;
    this.fetchFallbackAbortSignal = false;
    this.response = null;
    this.responseContentLength = null;
    this.responseLoadedLength = 0;
    this.responseData = null;
    this.responseType = 'arrayBuffer';

    if (global.AbortController) {
      this.fetchAbortController = new AbortController();
      this.fetchInit.signal = this.fetchAbortController.signal;
    }
  }

  static globalOptions = {};

  static setGlobalOptions(globalOptions) {
    Request.globalOptions = globalOptions;
  }

  /**
   * @inheritdoc
   * @override
   * @param {('ondata'|'onprogress'|'onabort'|'onerror'|'onload')} eventName
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  abort() {
    this.fetchAbortController && this.fetchAbortController.abort();

    this.fetchFallbackAbortSignal = true;
  }

  readData(reader) {
    setTimeout(() => {
      reader.read().then(({ done, value }) => {
        if (done) {
          this.dispatch('onload', [this.responseType === 'arrayBuffer' ? new Uint8Array(this.responseData) : this.responseData]);
        } else {
          if (this.fetchFallbackAbortSignal) {
            this.dispatch('onabort', [new Error('Request aborted')]);
            return;
          }

          if (this.responseType === 'plain') {
            let textDecoder = new TextDecoder();
            this.responseData += textDecoder.decode(value);
          } else if (this.responseType === 'arrayBuffer') {
            value.forEach(char => {
              this.responseData.push(char);
            });
          }

          this.responseLoadedLength += value.length;

          this.dispatch('ondata', [value]);

          this.dispatch('onprogress', [{ totalLength: this.responseContentLength, loadedLength: this.responseLoadedLength }]);

          this.readData(reader);
        }
      }).catch(error => {
        this.dispatch('onerror', [error]);
      });
    });
  }

  send(data = null) {
    let method = this.fetchInit.method.toUpperCase();

    if (method !== 'HEAD' && method !== 'GET' && !!data) {
      this.fetchInit.body = data;
    }

    if (Request.globalOptions.headers) {
      if (this.fetchInit.headers) {
        Object.assign(this.fetchInit.headers, Request.globalOptions.headers);
      } else {
        this.fetchInit.headers = Request.globalOptions.headers;
      }
    }

    fetch(this.url, this.fetchInit).then(response => {
      this.response = response;

      let contentLength = this.getResponseHeader('Content-Length');

      if (contentLength) {
        this.responseContentLength = parseInt(contentLength);
      }

      switch (this.responseType) {
        case 'plain':
          this.responseData = '';
          break;
        case 'arrayBuffer':
        default:
          this.responseData = [];
      }

      this.readData(this.response.body.getReader());
    }).catch(error => {
      this.dispatch('onerror', [error]);
    });
  }

  getResponseHeader(name) {
    if (this.response && this.response.headers.has(name)) {
      return this.response.headers.get(name);
    } else {
      return null;
    }
  }
}

export default Request;
