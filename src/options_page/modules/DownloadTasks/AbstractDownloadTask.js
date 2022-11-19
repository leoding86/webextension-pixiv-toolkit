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
   * @param {"start"|"progress"|"pause"|"stop"|"error"|"complete"|"failure"} eventName
   * @param {Function} listener
   * @param {any} thisArg
   */
  addListener(eventName, listener, thisArg) {
    super.addListener(eventName, listener, thisArg);
  }

  /**
   * Check if the task can be start
   * @throws {RuntimeError}
   */
   checkCouldStart() {
    if ([this.PENDING_STATE, this.FAILURE_STATE, this.COMPLETE_STATE].indexOf(this.state) < 0) {
      throw new RuntimeError(`Task can't start because its state isn't ready. state: ${this.state}`);
    }
  }

  /**
   * Mark the task has been deleted
   */
  markDelete() {
    this.isDelete = true;
  }

  start() {
    throw new NotImplementedError();
  }

  async pause() {
    throw new NotImplementedError();
  }

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
