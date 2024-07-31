import RuntimeError from "./RuntimeError";

export default class DownloadTaskNotFoundError extends RuntimeError {
  constructor(message = 'Download task not found') {
    super(message);

    this.name = 'DownloadTaskNotFoundError';
  }
}
