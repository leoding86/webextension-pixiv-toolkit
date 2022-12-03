import Dexie from 'dexie';

class AbstractRepo {
  /**
   * @type {number}
   */
  max;

  /**
   * @type {Dexie.Table}
   */
  table;

  constructor(table, { max }) {
    this.table = table;
    this.max = max;
  }

  /**
   *
   * @param {number} max
   */
  setMax(max) {
    this.max = max;
  }

  /**
   * @param {Object} data
   */
  async addItem(data) {
    let count = await this.table.count();

    if (count > this.max) {
      await this.table.limit(count - this.max).delete();
    }

    this.table.add(data);
  }

  /**
   * @param {Object} equals
   */
  async getItem(equals) {
    return await this.table.get(equals);
  }

  /**
   * @param {string} id
   */
  deleteItem(id) {
    this.table.where('id').equals(id).delete();
  }

  /**
   * @param {{ page: number?, count: number?}} param0
   * @returns
   */
  async getItems({ page, count = 20 }) {
    let collection = this.table.reverse();
    let offset = (page - 1) * count;

    if (offset > 0) {
      return await collection.offset(offset).limit(count).toArray();
    } else {
      return await collection.limit(count).toArray();
    }
  }

  async searchItems({ query, page, count = 20}) {
    let collection = this.table.reverse().filter(item => {
      return item.title.indexOf(query) > -1 || (item.userName && item.userName.indexOf(query) > -1);
    });
    let offset = (page - 1) * count;

    if (offset > 0) {
      return await collection.offset(offset).limit(count).toArray();
    } else {
      return await collection.limit(count).toArray();
    }
  }

  clear() {
    this.table.clear();
  }
}

export default AbstractRepo;
