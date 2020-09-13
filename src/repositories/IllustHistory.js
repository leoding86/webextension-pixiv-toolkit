import PouchDB from 'pouchdb'

class IllustHistory {

  constructor(options = { max: 10000 }) {
    this.db = this.getDb();
    this.maxLimit = options.max;
    this.properties = ['id', 'title', 'userId', 'userName', 'type', 'r', 'images', 'viewed_at', 'isNovel', 'image'];
    this.init();
  }

  getDb() {
    return new PouchDB('illust_histories', {
      revs_limit: 1
    });
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

    if (!data.id || !/^N?\d+$/.test(data.id)) {
      return false
    }

    if (!data.title || typeof data.title !== 'string') {
      return false
    }

    if (data.isNovel) {
      if (!data.image) {
        return false;
      }
    } else {
      if (!data.images) {
        return false;
      }

      if ([0, 1, 2].indexOf(data.type) < 0) {
        return false
      }

      ['thumb'].forEach(type => {
        if (!data.images[type] || typeof data.images[type] !== 'string') {
          data.images.thumb = '';
        }
      });
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

  /**
   *
   * @param {Array} items
   * @returns {Promise}
   */
  putBatchHistories(items) {
    let bulkGetOptions = {
      docs: []
    };
    let histories = [];
    let itemsById = {};

    items.forEach(item => {
      bulkGetOptions.docs.push({
        id: item.id
      });
      itemsById[item.id] = item;
    });

    /**
     * Check if there are exists items, if so, compare the viewed_at to determine if the incoming entry need to save.
     * After comparing, save incoming entry to histories array or skip it.
     */
    return this.db.bulkGet(bulkGetOptions).then(result => {
      result.results.forEach(item => {
        let doc = item.docs[0]; // Get first rev doc

        if (undefined !== doc.ok) {
          let incomingItem = itemsById[doc.ok.id];

          /**
           * Check if the incoming item is valid and comparing viewed_at proerty to the exists entry's viewed_at property
           */
          if (this.checkData(incomingItem) && parseInt(incomingItem.viewed_at) > doc.ok.viewed_at) {
            histories.push(Object.assign({}, doc.ok, incomingItem));
          }

          /**
           * Delete the item from itemsById then the left items are the items which not exists in db
           */
          itemsById[doc.ok.id] && delete itemsById[doc.ok.id];
        }
      });

      Object.keys(itemsById).forEach(id => {
        if (this.checkData(itemsById[id])) {
          histories.push(itemsById[id]);
        }
      });

      /**
       * Bulk create/update
       */
      return this.db.bulkDocs(histories);
    });
  }

  countItems(option = {}) {
    return this.db.allDocs(option).then(items => {
      return items.rows.length;
    });
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

  searchIllusts(option = {}) {
    let _selector = option.selector || { viewed_at: { $gte: null } };
    let _sort = option.sort || [{ 'viewed_at': 'desc'}];
    let _limit = option.limit;
    let _skip = option.skip || 0;
    let _fun = option.fun;

    return new Promise((resolve, reject) => {
      this.db.query(_fun, {
        selector: _selector,
        sort: _sort,
        limit: _limit,
        skip: _skip,
        include_docs: true
      }).then(response => {
        let docs = response.rows.map((row) => {
          return row.doc;
        });
        resolve(docs);
      }).catch(err => {
        reject(err);
      })
    });
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

  clearData() {
    this.db.destroy().then(() => {
      this.db = this.getDb();
      this.init();
    });
  }
}

export default IllustHistory
