import RuntimeError from "./RuntimeError";

export default class DownloadTaskExistsError extends RuntimeError {
  constructor(message = 'Download task is already exists') {
    super(message);

    this.name = 'DownloadTaskExistsError';
  }
}
