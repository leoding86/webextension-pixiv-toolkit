import { Storage as BrowserStorage } from '@/modules/Browser'

class SyncSubscribeTask {
  constructor() {
    this.storage = BrowserStorage.getInstance()
    this.updateInterval = 3600
    this.users = {}
    this.keys = []
    this.index = 0
  }

  init(users) {
    this.users = users
    this.keys = Object.keys(users)
    this.index = 0
  }

  handle() {
    let self = this

    return new Promise((resolve, reject) => {
      this.storage.get(['subscribedUsers']).then(items => {
        let users = items.subscribedUsers || {}

        self.init(users)

        self.syncUsersWorks().then(() => {
          resolve()
        }).catch(() => {
          //
        })
      })
    })
  }

  next() {
    ++this.index
  }

  nextUser() {
    return this.users[this.keys[++this.index]]
  }

  currentUser() {
    return this.users[this.keys[this.index]]
  }

  syncUsersWorks() {
    let self = this

    return new Promise((resolve, reject) => {
      let user = self.currentUser()

      if (!user) {
        resolve()
        return
      }

      let syncTime = Math.round(Date.now() / 1000) + self.updateInterval

      if (!user.lastSync || user.lastSync < syncTime) {
        self.requestLastestWorks(user).then((lastestWork) => {
          if (lastestWork.illustWorkId > user.lastestIllustWorkId) {
            // there is new work
            user.lastestIllustWorkId = lastestWork.illustWorkId

            // store
            // console.log('there is new')
          }

          self.next()

          resolve(self.syncUsersWorks())
        }).catch(() => {
          self.next()

          resolve(self.syncUsersWorks())
        })
      } else {
        self.next()

        resolve(self.syncUsersWorks())
      }
    })
  }

  requestLastestWorks(user) {
    let url = 'https://www.pixiv.net/ajax/user/' + user.id + '/profile/all'

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()

      xhr.open('GET', url)

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText)

            if (data && data.body) {
              // console.log(data.body)

              let illustsIds = Object.keys(data.body.illusts)

              let lastestIllustWorkId = illustsIds.pop()

              resolve({
                illustWorkId: lastestIllustWorkId
              })

              return
            }
          }
        }

        reject()
      }

      xhr.send()
    })
  }
}

export default SyncSubscribeTask
