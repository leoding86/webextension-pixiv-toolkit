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

  /**
   *
   * @param {number} max
   */
  setMax(max) {
    this.max = max;
  }

  /**
   * @param {ItemType} data
   */
  async addItem(data) {
    let count = await this.table.count();

    if (count > this.max) {
      await this.table.limit(count - this.max).delete();
    }

    let item = await this.table.get({ uid: data.uid });

    if (item) {
      this.table.update(item.id, data);
    } else {
      this.table.add(data);
    }
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
  async getItems({ page, count } = { page: 1, count: 20}) {
    return await this.table.reverse().offset((page - 1) * count);
  }

  clear() {
    this.table.clear();
  }
}

export default AbstractRepo;
