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

    window.addEventListener('error', e => {
      this.emitError(e.error);
    });

    window.addEventListener('unhandledrejection', e => {
      this.emitError(new Error(e.reason));
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
  emitError(error) {
    let message = '';

    if (typeof error === 'string') {
      message = error;
    } else if (!error) {
      message = '';
    } else {
      message = error.message + "\r\n" + error.stack
    }

    this.dispatch('error', [message]);
  }
}

export default ErrorTracker;
