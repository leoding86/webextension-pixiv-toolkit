import Browser from '@/modules/Browser/Browser'

class Logger {
  static browser = Browser.getBrowser()

  static log(level, message) {
    Logger.browser.runtime.sendMessage({
      action: 'log:recordLog',
      message: message,
      level: level
    })
  }

  static notice(message) {
    Logger.log('notice', message)
  }

  static success(message) {
    Logger.log('success', message)
  }

  static error(message) {
    Logger.log('error', message)
  }
}

export default Logger
