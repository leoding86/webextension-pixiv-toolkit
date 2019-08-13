import PouchDB from 'pouchdb'

class SubscribedUser {
  constructor() {
    this.db = new PouchDB('subscribed_users')
  }

  putUser(data) {
    let self = this

    let userDoc = Object.assign({
      _id: data.id
    }, data)

    return new Promise(resolve => {
      self.db.get(userDoc.id).then(doc => {
        return self.db.put(Object.assign(doc, userDoc))
      }).catch(err => {
        return self.db.put(userDoc)
      }).then(result => {
        resolve(result)
      })
    })
  }

  getUser(id) {
    let self = this

    return new Promise(resolve => {
      self.db.get(id).then(doc => {
        resolve(doc)
      }).catch(err => {
        resolve(null)
      })
    })
  }

  deleteUser(id) {
    let self = this

    return new Promise(resolve => {
      self.db.get(id).then(doc => {
        return self.db.remove(doc)
      }).then(() => {
        resolve(true)
      }).catch(() => {
        resolve(true)
      })
    })
  }

  listUsers() {
    let self = this

    return new Promise(resolve => {
      self.db.allDocs({
        include_docs: true
      }).then(response => {
        resolve(response.rows.map(row => {
          return row.doc
        }))
      })
    })
  }
}

export default SubscribedUser
