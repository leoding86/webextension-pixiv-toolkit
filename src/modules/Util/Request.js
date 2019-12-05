import Event from '@/modules/Event';

class Request {
  constructor() {
    this.method = null;
    this.url = null;
    this.event = new Event();
    this.fetch = null;
    this.requestSended = false;
    this.readAsStream_ = false;
  }

  readAsStream() {
    if (window && window.ReadableStream) {
      this.readAsStream_ = true;
    }

    return this.readAsStream_;
  }

  isReadAsStream() {
    return this.readAsStream_;
  }

  open(method, url) {
    if (this.fetch) {
      this.fetch.abort();
    }

    this.requestSended = false;
    this.method = method;
    this.url = url;
  }

  abort() {
    if (this.fetch) {
      this.fetch.abort();
    }
  }

  send(data = null) {
    if (this.requestSended) {
      throw 'Request has been sended';
    }

    let init = {
      method: this.method.toUpperCase()
    };

    if (init.method !== 'HEAD' && init.method !== 'GET' && !!data) {
      init.body = data;
    }

    this.fetch = new Fetch(this.url, init, this.event, { readAsStream: this.readAsStream_ });
    this.fetch.send();
  }
}

class Fetch {
  constructor(url, init, event, options) {
    this.url = url;
    this.init = init;
    this.event = event;
    this.abortSignal = false;
    this.totalSize = undefined;
    this.responseCompletedSize = undefined;
    this.responseTotalSize = undefined;
    this.options = options;
  }

  abort() {
    this.abortSignal = true;
    this.event.dispatch('onabort');
  }

  readData(reader) {
    setTimeout(() => {
      reader.read().then(({done, value}) => {
        if (done) {
          this.event.dispatch('onfinish');
          return;
        }

        this.responseCompletedSize += value.length;

        this.event.dispatch('ondata', [value]);

        this.event.dispatch('onprogress', [this.responseCompletedSize / this.responseTotalSize]);

        this.readData(reader);
      }).catch(error => {
        this.event.dispatch('onerror', [error]);
      });
    });
  }

  readDataFromResponse(response) {
    const reader = response.body.getReader();

    this.readData(reader);
  }

  send() {
    let self = this;

    fetch(this.url, this.init).then(response => {
      if (response.status !== 200) {
        self.event.dispatch('onerror');
        return;
      }

      if (!self.abortSignal) {
        if (this.options.readAsStream) {
          const contentLength = response.headers.get('Content-Length');

          if (contentLength) {
            this.responseTotalSize = parseInt(contentLength.indexOf(',') ? contentLength.split(',')[0] : contentLength);
          }

          this.responseCompletedSize = 0;
          this.readDataFromResponse(response);
        } else {
            self.event.dispatch('onload', [response]);
        }
      }
    }).catch(error => {
      self.event.dispatch('onerror', [error]);
    });
  }
}

export default Request;
