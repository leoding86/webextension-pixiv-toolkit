import Browser from '@/modules/Browser/Browser'

class PlusAddonPort {
  static instance

  static getInstance() {
    if (PlusAddonPort.instance) {
      return PlusAddonPort.instance
    }

    return PlusAddonPort.instance = new PlusAddonPort(name)
  }

  constructor(name) {
    this.extensionId = 'fnljpdfpdilgbfgdcmhckjhoibfdkgdk'
    this.browser = Browser.getBrowser()
    this.port

    this.createPort(name)
  }

  createPort(name)
  {
    this.port = this.browser.runtime.connect(this.extensionId, {
      name: name
    })

    return this
  }

  postMessage(args) {
    try {
      this.port.postMessage(args)
    } catch (e) {
      // console.log(e)
    }
  }

  checkPlusAddonInstalled() {
    this.postMessage({
      action: 'checkPlusAddon'
    })
  }

  saveIllustHistory(args) {
    this.postMessage({
      action: 'saveIllustHistory',
      args: args
    })
  }

  listIllustHistoriesAction(args) {
    return this.sendMessage({
      action: 'listIllustHistories',
      args: args
    })
  }

  deleteIllustHistory(args) {
    return this.sendMessage({
      action: 'deleteIllustHistory',
      args: args
    })
  }

  getSubscribedUsers(args) {
    //
  }

  subscribeUser(args) {
    //
  }

  unsubscribeUser(args) {
    //
  }

  hasUserSubscribed(args) {
    //
  }

  syncUsersSubscription(args) {
    //
  }

  updateSubscribedUser(args) {
    //
  }
}

export default PlusAddonPort
