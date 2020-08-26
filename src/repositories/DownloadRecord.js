import PouchDB from 'pouchdb';

class DownloadRecord {
  static instance;

  constructor(options = { max: 10000 }) {
    this.db = this.getDb();
    this.maxLimit = options.max;
    this.init();
  }

  /**
   * @returns {DownloadRecord}
   */
  static getDefault() {
    if (!DownloadRecord.instance) {
      DownloadRecord.instance = new DownloadRecord();
    }

    return DownloadRecord.instance;
  }

  getDb() {
    return new PouchDB('download_record', {
      revs_limit: 1
    });
  }

  /**
   * Initialize database, create indexe on `_id` and `downloaded_at` separately
   */
  init() {
    this.db.createIndex({
      index: {
        fields: ['_id']
      }
    });

    this.db.createIndex({
      index: {
        fields: ['downloaded_at']
      }
    });
  }

  checkLimitationAndRemove() {
    this.db.allDocs().then(entries => {
      let deleteLength = entries.rows.length - this.maxLimit;

      if (deleteLength > 0) {
        this.db.find({
          selector: { downloaded_at: { $gte: null } },
          sort: [{ 'downloaded_at': "desc"}],
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

  putRecord(record) {
    this.checkLimitationAndRemove();

    record.downloaded_at = Math.floor(Date.now() / 1000);

    return this.retrieveRecord(record._id).then(doc => {
      doc = Object.assign(doc, record);

      return this.db.put(doc);
    }).catch(error => {
      if (error.status === 404) {
        return this.db.put(record);
      }
    });
  }

  /**
   * Get a download using download's id
   * @param {string} id
   */
  getDownload(id) {
    return this.db.get(id);
  }

  /**
   * Delete a download using download's id
   * @param {string} id
   */
  deleteDownload(id) {
    return this.getDownload(id).then(doc => {
      return this.db.remove(doc);
    }).catch(error => {
      throw error;
    });
  }

  /**
   * List downloads
   * @param {Object} options
   * @param {Object} [options.selector={downloaded_at:{$gte:null}}]
   * @param {Object} [options.sort=[{downloaded_at:'desc'}]]
   * @param {Number} [options.limit=50]
   * @param {Number} [options.skip=0]
   * @param {(Function|null)} [options.fun=null]
   */
  listDownloads(options) {
    let queryOptions = {
      selector: options.selector || { downloaded_at: { $gte: null } },
      sort: options.sort || [{ downloaded_at: 'desc' }],
      limit: options.limit || 50,
      skip: options.skip || 0,
    }, fun = options.fun || null;

    if (!fun) {
      return this.db.find(queryOptions).then(response => {
        return response.docs;
      });
    } else {
      queryOptions.include_docs = true;

      return this.db.query(fun, queryOptions).then(response => {
        return response.rows.map(row => {
          return row.doc;
        });
      });
    }
  }

  /**
   * Clear all downloads
   */
  clearDownloads() {
    this.db.destroy().then(() => {
      this.db = this.getDb();
      this.init();
    });
  }

  retrieveRecord(id) {
    return this.db.get(id);
  }

  retrieveRecordsFromIds(ids) {
    return this.db.query(
      (doc, emit) => {
        if (ids.indexOf(doc._id) > -1) {
          emit(doc);
        }
      }, {
        limit: ids.length,
        include_docs: true
      }
    ).then(response => {
      return response.rows.map((row) => {
        return row.doc;
      });
    });
  }
}

export default DownloadRecord;
