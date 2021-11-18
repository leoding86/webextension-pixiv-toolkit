import Event from '@/modules/Event';

class ErrorTracker extends Event {
  /**
   * @type {ErrorTracker}
   */
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();

    this.tracks = [];

    window.addEventListener('error', e => {
      this.pushError(e.error);
    });

    window.addEventListener('unhandledrejection', e => {
      this.pushError(new Error(e.reason));
    });
  }

  /**
   * Get the default tracker
   * @returns {ErrorTracker}
   */
  getTracker() {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }

    return ErrorTracker.instance;
  }

  /**
   *
   * @param {Error} error
   */
  pushError(error) {
    if (this.tracks.length >= 500) {
      this.tracks.shift();
    }

    let message = error.message + "\r\n" + error.stack

    this.tracks.push(message);

    this.dispatch('error', [message]);
  }
}

export default ErrorTracker;
