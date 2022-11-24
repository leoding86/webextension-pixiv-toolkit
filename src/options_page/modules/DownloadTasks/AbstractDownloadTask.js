import NotImplementedError from "@/errors/NotImplementedError";
import Event from "@/modules/Event";
import { RuntimeError } from "@/errors";

class AbstractDownloadTask extends Event {
  /**
   * @type {string} Download task type
   */
  type;

  /**
   * @type {number}
   */
  state;

  /**
   * @type {string}
   */
  id;

  /**
   * @type {string}
   */
  url;

  /**
   * @type {string}
   */
  title = '';

  /**
   * @type {any}
   */
  context = {};

  /**
   * @type {number}
   */
  progress = 0;

  /**
   * @type {Error|string}
   */
  lastError;

  /**
   * @type {number}
   */
  lastDownloadId;

  /**
   * @type {boolean}
   */
  isDelete = false;

  constructor() {
    super();
    this.PENDING_STATE = 1;
    this.DOWNLOADING_STATE = 2;
    this.PAUSED_STATE = 3;
    this.COMPLETE_STATE = 4;
    this.FAILURE_STATE = -1;
    this.PROCESSING_STATE = 99;

    this.state = this.PENDING_STATE;
  }

  isPending() {
    return this.state === this.PENDING_STATE;
  }

  isDownloading() {
    return this.state === this.DOWNLOADING_STATE;
  }

  isPaused() {
    return this.state === this.PAUSED_STATE;
  }

  isComplete() {
    return this.state === this.COMPLETE_STATE;
  }

  isFailure() {
    return this.state === this.FAILURE_STATE;
  }

  /**
   * @inheritdoc
   * @override
   * @param {"start"|"progress"|"pause"|"stop"|"error"|"complete"|"failure"|"statechange"} eventName
   * @param {Function} listener
   * @param {any} thisArg
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  /**
   * Change task's state
   * @param {number} state
   * @fires this#statechange
   */
  changeState(state) {
    this.state = state;
    this.dispatch('statechange');
  }

  /**
   * @throws {RuntimeError}
   */
  tryPending() {
    if (this.isPending()) {
      return;
    }

    if (this.isPaused() || this.isFailure() || this.isComplete()) {
      this.changeState(this.PENDING_STATE);
    }

    throw new RuntimeError(`Task can't be pending`);
  }

  /**
   * Mark the task has been deleted
   */
  markDelete() {
    this.isDelete = true;
  }

  /**
   * Before you start a download, call tryPending first to make sure the download
   * can start.
   */
  async start() {
    throw new NotImplementedError();
  }

  async pause() {
    throw new NotImplementedError();
  }

  /**
   * Must call stop method before delete the task
   */
  async stop() {
    throw new NotImplementedError();
  }

  toJson() {
    return {
      type: this.type,
      id: this.id,
      url: this.url,
      title: this.title,
      context: this.context,
      state: this.state,
      progress: this.progress,
      downloadId: this.lastDownloadId,
    };
  }
}

export default AbstractDownloadTask;
