class RequestData {
  static instance

  constructor() {
    this.xhr = new XMLHttpRequest()
    this.logger
  }

  static getInstance() {
    if (RequestData.instance) {
      return RequestData.instance
    }

    RequestData.instance = new RequestData()
  }

  setLogger(logger) {
    this.logger = logger
  }

  log(level, message) {
    if (this.logger && typeof this.logger[level] === 'function') {
      this.logger[level](message)
    }
  }

  send(message) {
    this.log('notice', message)

    this.xhr.addEventListener('readystatechange', () => {
      if (this.xhr.status === 4) {
        if (this.xhr.statusText === 200) {
          this.log('success', message)
        } else {
          this.log('error', message)
        }
      }
    })
  }
}

export default RequestData
