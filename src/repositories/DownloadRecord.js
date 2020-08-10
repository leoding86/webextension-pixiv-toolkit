import PouchDB from 'pouchdb';

class DownloadRecord {
  static instance;

  constructor({ max = 10000 }) {
    this.db = new PouchDB('download_record', {
      revs_limit: 1
    });

    this.maxLimit = max;

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

  init() {
    return this.db.createIndex({
      index: {
        fields: ['_id', 'downloaded_at']
      }
    })
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

    return this.retrieveRecord(record._id).then(doc => {
      doc = Object.assign(doc, record);

      return this.db.put(doc);
    }).catch(error => {
      if (error.status === 404) {
        return this.db.put(record);
      }
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
