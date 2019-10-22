import Event from '@/modules/Event';

class Request {
  constructor() {
    this.method = null;
    this.url = null;
    this.event = new Event();
    this.fetch = null;
    this.requestSended = false;
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

    this.fetch = new Fetch(this.url, init, this.event);
    this.fetch.send();
  }
}

class Fetch {
  constructor(url, init, event) {
    this.url = url;
    this.init = init;
    this.event = event;
    this.abortSignal = false;
  }

  abort() {
    this.abortSignal = true;
    self.event.dispatch('onabort');
  }

  send() {
    let self = this;

    fetch(this.url, this.init).then(response => {
      if (response.status !== 200) {
        self.event.dispatch('onerror');
        return;
      }

      if (!self.abortSignal) {
        self.event.dispatch('onload', [response]);
      }
    }).catch(error => {
      self.event.dispatch('onerror', [error]);
    });
  }
}

export default Request;
