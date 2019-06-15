import Browser from '@/modules/Browser/Browser'

class PlusAddon {
  constructor() {
    this.extensionId = 'goembpdahiginhplnkjopmieffglncne'

    this.checkBeforeSend = false

    this.browser = Browser.getBrowser()
  }

  sendMessage(args) {
    let self = this

    return new Promise((resolve, reject) => {
      if (this.checkBeforeSend && args.action !== 'checkPlusAddon') {
        this.checkPlusAddonInstalled().then(response => {
          if (response) {
            self.browser.runtime.sendMessage(self.extensionId, args, response => {
              resolve(response)
            })
          } else {
            resolve(null)
          }
        })
      } else {
        self.browser.runtime.sendMessage(self.extensionId, args, response => {
          resolve(response)
        })
      }
    })
  }

  checkPlusAddonInstalled() {
    return this.sendMessage({
      action: 'checkPlusAddon'
    })
  }

  getSubscribedUsers(args) {
    return this.sendMessage({
      action: 'getSubscribedUsers',
      args: args
    })
  }

  subscribeUser(args) {
    return this.sendMessage({
      action: 'subscribeUser',
      args: args
    })
  }

  unsubscribeUser(args) {
    return this.sendMessage({
      action: 'unsubscribeUser',
      args: args
    })
  }

  hasUserSubscribed(args) {
    return this.sendMessage({
      action: 'hasUserSubscribed',
      args: args
    })
  }

  syncUsersSubscription(args) {
    return this.sendMessage({
      action: 'syncUsersSubscription',
      args: args
    })
  }

  updateSubscribedUser(args) {
    return this.sendMessage({
      action: 'updateSubscribedUser',
      args: args
    })
  }

  saveIllustHistory(args) {
    return this.sendMessage({
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
}

export default PlusAddon
