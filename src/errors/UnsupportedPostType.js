export default class UnsupportedPostType extends Error {
  constructor(message = 'Unsupported post type') {
    super(message);

    this.name = 'UnsupportedPostType';
  }
}
