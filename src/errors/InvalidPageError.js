export default class InvalidPageError extends Error {
  constructor(message = 'invalid_page') {
    super(message);

    this.name = 'InvalidPageError';
  }
}
