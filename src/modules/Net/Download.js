import Request from '@/modules/Net/Request';

class Download extends Request {
  /**
   * @constructor
   * @param {string} url
   * @param {object} options
   */
  constructor(url, options = {}) {
    super(url, options);

    this.asBlob = true;
  }

  /**
   * @override
   * @param {('ondata'|'onprogress'|'onabort'|'onerror'|'onload'|'onfinish')} eventName
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  /**
   * @param {any} data
   */
  download(data = null) {
    let self = this;

    this.addListener('onload', data => {
      let mimeType = self.getResponseHeader('Content-Type');
      self.dispatch('onfinish', [self.asBlob ? new Blob([data.buffer], { type: mimeType }) : data.buffer, mimeType]);
    });

    this.send(data)
  }
}

export default Download;
