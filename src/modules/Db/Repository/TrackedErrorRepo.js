/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-01 01:14:07
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-08-11 13:58:22
 * @FilePath: \webextension-pixiv-toolkit\src\modules\Db\Repository\TrackedErrorRepo.js
 */
import AbstractRepo from "./AbstractRepo";
import Dexie from 'dexie';

class TrackedErrorRepo extends AbstractRepo {
  /**
   * @type {TrackedErrorRepo}
   */
  static instance;

  /**
   *
   * @param {Dexie.Table} table
   */
  constructor(table, { max } = { max: 500 }) {
    super(table, { max });
  }

  /**
   *
   * @param {Dexie.Table} table
   * @returns {TrackedErrorRepo}
   */
  static getDefault(table) {
    if (!TrackedErrorRepo.instance) {
      TrackedErrorRepo.instance = new TrackedErrorRepo(table);
    }

    return TrackedErrorRepo.instance;
  }

  /**
   * @inheritdoc
   */
  async addItem({ error, created_at }) {
    await super.addItem({ error, created_at });
  }
}

export default TrackedErrorRepo;
