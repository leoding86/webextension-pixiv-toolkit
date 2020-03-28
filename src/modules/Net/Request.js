import Event from '@/modules/Event';
import { arraybuffer } from '@/statics/lib/jszip/jszip';

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

    if (AbortController) {
      this.fetchAbortController = new AbortController();
      this.fetchInit.signal = this.fetchAbortController.signal;
    }
  }

  abort() {
    this.fetchAbortController && this.fetchAbortController.abort();

    this.fetchFallbackAbortSignal = true;
  }

  readData(reader) {
    if (this.fetchFallbackAbortSignal) {
      this.dispatch('onerror', [new Error('Request aborted')]);
      return;
    }

    setImmediate(() => {
      reader.read().then(({ done, value }) => {
        if (done) {
          this.dispatch('onload', [this.responseType === 'arrayBuffer' ? new Uint8Array(this.responseData) : this.responseData]);
        } else {
          if (this.responseType === 'plain') {
            let index = 0;

            while (true) {
              let arrayBuffer = value.slice(index, index + 10000);

              index += 10000;

              if (arrayBuffer.length > 0) {
                this.responseData += String.fromCharCode.apply(null, arrayBuffer);
              } else {
                break;
              }
            }
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
