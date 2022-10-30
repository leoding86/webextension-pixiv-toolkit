import AbstractDownloadTask from './DownloadTasks/AbstractDownloadTask';
import DownloadTaskExistsError from '@/errors/DownloadTaskExistsError';
import DownloadTaskNotFoundError from '@/errors/DownloadTaskNotFoundError';
import Event from '@/modules/Event';

/**
 * @class Manage download tasks
 */
class DownloadManager extends Event {
  /**
   * @type {DownloadManager}
   */
  static defaultInstance;

  /**
   * Download tasks collection
   * @type {Map<string,AbstractDownloadTask>}
   */
  tasks = new Map();

  /**
   * @type {string[]}
   */
  changedTaskIds = [];

  /**
   * @type {number}
   */
  downloadingTasksAtSametime = 3;

  /**
   *
   * @returns {DownloadManager}
   */
  static getDefault() {
    if (!DownloadManager.defaultInstance) {
      DownloadManager.defaultInstance = new DownloadManager();
    }

    return DownloadManager.defaultInstance;
  }

  /**
   * Set property `downloadingTasksAtSametime`, max is 3 and min is 1
   * @param {number} number
   */
  setDownloadingTasksAtSametime(number) {
    number = number < 0 ? 1 : number;
    number = number > 3 ? 3 : number;

    this.downloadingTasksAtSametime = number;
  }

  /**
   * Get a download task using given id
   * @param {string} id
   * @returns
   * @throws {DownloadTaskNotFoundError}
   */
  getTask(id) {
    if (!this.tasks.has(id)) {
      throw new DownloadTaskNotFoundError();
    }

    return this.tasks.get(id);
  }

  tasksUpdate(id) {
    if (this.changedTaskIds.indexOf(id) < 0) {
      this.changedTaskIds.push(id);
    }
  }

  getAllTasks() {
    return this.tasks;
  }

  getAvaliableTasksJson() {
    let dataset = [];

    Array.from(this.tasks).forEach(item => {
      let task = item[1];

      if (!task.isDelete) {
        dataset.push(task.toJson());
      }
    });

    return dataset;
  }

  flushChangedTasks() {
    let changedTaskIds = this.changedTaskIds;
    this.changedTaskIds = [];
    let tasks = Array.from(this.tasks).filter(item => {
      let task = item[1];
      return changedTaskIds.indexOf(task[task.idKey ? task.idKey : task.id]) > -1;
    });
    return tasks;
  }

  listenTaskEvents(task) {
    task.addListener('start');

    task.addListener('progress');

    task.addListener('pause');

    task.addListener('stop');

    task.addListener('error');

    task.addListener('complete');

    task.addListener('failure');
  }

  /**
   * @returns {AbstractDownloadTask[]}
   */
  get downloadingTasks() {
    return Array.from(this.tasks).filter(item => item[1].isDownloading());
  }

  /**
   *
   * @returns {boolean}
   */
  reachDownloadingTasksLimit() {
    return this.downloadingTasks.length >= this.downloadingTasksAtSametime;
  }

  /**
   * Find which download task ready for starting and start it.
   */
  startTasks() {
    let tasks = Array.from(this.tasks);

    for (let item of tasks) {
      let task = item[1];

      if (task.isPending()) {
        if (!this.reachDownloadingTasksLimit()) {
          task.start();
        } else {
          break;
        }
      }
    }
  }

  /**
   * Add a download task to manager, throw error if it has the same id.
   * @param {any} task
   * @throws {DownloadTaskExistsError}
   */
  async addTask(task) {
    let id = task[task.idKey ? task.idKey : 'id'];

    if (this.tasks.has(id)) {
      throw new DownloadTaskExistsError();
    }

    this.listenTaskEvents(task);

    this.tasks.set(id, task);
    this.startTasks();
    // await task.start();
  }

  /**
   * Delete a download task
   * @param {number} id
   */
  async deleteTask(id) {
    let downloadTask = this.getTask(id);
    downloadTask.markDelete();
    downloadTask.stop();
    this.tasks.delete(id);
  }

  /**
   * Start a download task
   * @param {number} id
   */
  async startTask(id) {
    await this.getTask(id).start();
  }

  /**
   * Pause a download task
   * @param {number} id
   */
  async pauseTask(id) {
    await this.getTask(id).pause();
  }

  /**
   * Stop a download task
   * @param {number} id
   */
  async stopTask(id) {
    await this.getTask(id).stop();
  }
}

export default DownloadManager;
