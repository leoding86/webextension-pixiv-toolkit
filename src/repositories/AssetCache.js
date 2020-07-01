import PouchDB from 'pouchdb';

class AssetCache {
  constructor() {
    this.db = new PouchDB('asset_caches', {
      revs_limit: 1
    });

    this.maxLimit = 2000;

    this.init();
  }

  init() {
    return this.db.createIndex({
      index: {
        fields: ['cached_at']
      }
    })
  }

  checkLimitationAndRemove() {
    this.db.allDocs().then(entries => {
      let deleteLength = entries.rows.length - this.maxLimit;

      if (deleteLength > 0) {
        this.db.find({
          selector: { cached_at: { $gte: null } },
          sort: [{ 'cached_at': "asc"}],
          limit: deleteLength
        }).then(response => {
          response.docs.forEach(doc => {
            this.db.remove(doc).catch(err => {
              console.log(err);
            });
          })
        })
      }
    })
  }

  putAsset(id, asset) {
    this.checkLimitationAndRemove();

    return new Promise(resolve => {
      this.db.get(id).then(() => {
        resolve();
      }).catch(() => {
        resolve(this.db.put({
          _id: id,
          asset: asset,
          cached_at: parseInt((Date.now() + '').substr(0, 10))
        }));
      });
    });
  }

  retrieveAsset(id) {
    return new Promise((resolve, reject) => {
      this.db.get(id).then(doc => {
        resolve(doc);
      }).catch(err => {
        reject(err);
      });
    });
  }
}

export default AssetCache;
