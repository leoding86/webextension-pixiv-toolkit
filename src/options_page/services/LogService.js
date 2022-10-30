import AbstractService from "./AbstractService";

class LogService extends AbstractService {
  static instance;

  errors = [];

  static getService() {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }

    return LogService.instance;
  }

  recordLog(args) {
    //
  }

  trackError({ error }) {
    if (this.errors.length > 500) {
      this.errors.shift();
    }

    this.errors.push(error);
  }

  getTrackedErrors() {
    return this.errors;
  }
}

export default LogService;
