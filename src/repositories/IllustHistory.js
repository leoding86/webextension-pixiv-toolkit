import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

PouchDB.plugin(PouchDBFind)

class IllustHistory {
  constructor() {
    this.db = new PouchDB('illust_histories');

    this.maxLimit = 10000;

    this.properties = ['id', 'title', 'type', 'r', 'images', 'viewed_at'];

    this.init();
  }

  init() {
    return this.db.createIndex({
      index: {
        fields: ['viewed_at']
      }
    })
  }

  checkData(data) {
    // check id

    if (!data.id || !/^\d+$/.test(data.id)) {
      return false
    }

    if (!data.title || typeof data.title !== 'string') {
      return false
    }

    if (!data.images) {
      return false
    }

    ['thumb'].forEach(type => {
      if (!data.images[type] || typeof data.images[type] !== 'string') {
        data.images.thumb = '';
      }
    });

    if (data.type === undefined) {
      return false
    }

    if ([0, 1, 2].indexOf(data.type) < 0) {
      return false
    }

    if (!data.viewed_at || !/^[1-9]\d+$/.test(data.viewed_at)) {
      return false
    }

    if (typeof data.r !== 'boolean') {
      return false
    }

    return true
  }

  putIllust(data) {
    let self = this

    return new Promise(resolve => {
      if (!this.checkData(data)) {
        resolve()
        return
      }

      this.db.allDocs().then(entries => {
        if (entries.rows.length > this.maxLimit) {
          let deleteLength = entries.rows.length - this.maxLimit;

          this.getIllusts({
            sort: [{ 'viewed_at': "asc" }],
            limit: deleteLength
          }).then(docs => {
            docs.forEach(doc => {
              this.db.remove(doc);
            });
          });
        }
      });

      if ((data.viewed_at + '').length > 10) {
        data.viewed_at = parseInt((data.viewed_at + '').substr(0, 10)) // viewed_at is index, should keep its type
      }

      // for (let i in self.properties) {
      //   if (!data.hasOwnProperty(i)) {
      //     resolve(null)
      //   }
      // }

      if (data._rev) {
        delete data._rev
      }

      let dataDoc = Object.assign(data, {
        _id: data.id
      })

      self.db.get(dataDoc.id).then(doc => {
        let _doc = Object.assign(doc, dataDoc)
        self.db.put(_doc).then(() => {
          // console.log('update done')
          resolve()
        }).catch(e => {
          // console.log('update fail')
          // console.log(e)
          resolve()
        })
      }).catch(err => {
        self.db.put(dataDoc).then(() => {
          // console.log('create done')
          resolve()
        }).catch(e => {
          // console.log('create fail')
          // console.log(e)
          resolve()
        })
      })
    })
  }

  getIllusts(option = {}) {
    let _selector = option.selector || { viewed_at: { $gte: null } }
    let _sort = option.sort || [{ 'viewed_at': "desc" }]
    let _limit = option.limit
    let _skip = option.skip || 0

    return new Promise(resolve => {
      this.db.find({
        selector: _selector,
        sort: _sort,
        limit: _limit,
        skip: _skip
      }).then(response => {
        resolve(response.docs)
      }).catch(err => {
        resolve(err.docs)
      })
    })
  }

  deleteIllust({id}) {
    let self = this

    return new Promise(resolve => {
      this.db.get(id).then(doc => {
        resolve(self.db.remove(doc))
      }).catch(err => {
        resolve()
      })
    })
  }

  searchIllusts() {
    return new Promise(resolve => {

    })
  }
}

export default IllustHistory
