import Browser from '@/modules/Browser/Browser'

class BaseAction {
  constructor() {
    this.browser = Browser.getBrowser()
  }
}

export default BaseAction
