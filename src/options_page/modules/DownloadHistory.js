import PouchDB from 'pouchdb';

/**
 * @class
 */
class DownloadHistory {
  /**
   * @type {DownloadHistory}
   */
  static instance;

  /**
   * @type {PouchDB}
   */
  db;

  /**
   * @type {number}
   */
  maxLimit;

  /**
   * Create and connect to the database and Initialize it
   * @param {{max: number}} options
   */
  constructor(options = { max: 10000 }) {
    this.db = this.getDb();
    this.maxLimit = options.max;
    this.init();
  }

  /**
   * Get default DownloadHistory instance
   * @returns {DownloadHistory}
   */
  static getDefault() {
    if (!DownloadHistory.instance) {
      DownloadHistory.instance = new DownloadHistory();
    }

    return DownloadHistory.instance;
  }

  /**
   * Get database
   * @returns {PouchDB}
   */
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

  async checkLimitationAndRemove() {
    let entries = await this.db.allDocs();
    let deleteLength = entries.rows.length - this.maxLimit;

    if (deleteLength > 0) {
      let response = await this.db.find({
        selector: { downloaded_at: { $gte: null }},
        sort: [{ 'downloaded_at': 'desc' }],
        limit: deleteLength,
      });

      response.docs.forEach(doc => {
        this.db.remove(doc);
      });
    }
  }

  /**
   * Add or update a record
   * @param {any} record
   * @returns
   */
  async putRecord(record) {
    this.checkLimitationAndRemove();

    record.downloaded_at = Math.floor(Date.now() / 1000);

    try {
      let doc = await this.getRecord(record._id);
      doc.assign(doc, record);

      return this.db.put(doc);
    } catch (error) {
      if (error.status === 404) {
        return this.db.put(record);
      }
    }
  }

  /**
   * Get a download using download's id
   * @param {string} id
   */
  getRecord(id) {
    return this.db.get(id);
  }

  /**
   * Delete a download using download's id
   * @param {string} id
   */
  async deleteRecord(id) {
    let doc = this.getRecord(id);
    this.db.remove(doc);
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
  async listRecords(options) {
    let queryOptions = {
      selector: options.selector || { downloaded_at: { $gte: null } },
      sort: options.sort || [{ downloaded_at: 'desc' }],
      limit: options.limit || 50,
      skip: options.skip || 0,
    }, fun = options.fun || null;

    if (!fun) {
      let response = await this.db.find(queryOptions);
      return response.docs;
    } else {
      let response = await this.db.query(fun,  Object.assign(queryOptions, { include_docs: true }));
      return response.rows.map(row => row.doc);
    }
  }

  /**
   * Clear all downloads
   */
  async clearRecords() {
    await this.db.destroy();
    this.db = this.getDb();
    this.init();
  }

  async getRecordsFromIds(ids) {
    let response = await this.db.query((doc, emit) => {
      if (ids.indexOf(doc._id) > -1) {
        emit(doc);
      }
    }, {
      limit: ids.length,
      include_docs: true,
    });

    return response.rows.map(row => row.doc);
  }
}

export default DownloadHistory;
