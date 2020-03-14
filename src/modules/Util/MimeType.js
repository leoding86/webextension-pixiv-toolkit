class MimeType {
  static types = {
    'image/png'       : 'png',
    'image/gif'       : 'gif',
    'image/jpeg'      : 'jpg',
    'image/jpg'       : 'jpg',
    'text/plain'      : 'txt',
    'text/html'       : 'html',
    'application/json': 'json'
  }

  /**
   *
   * @param {string} mimeType
   */
  static getExtenstion(mimeType) {
    mimeType = mimeType.toLowerCase();

    if (MimeType.types[mimeType]) {
      return MimeType.types[mimeType];
    } else {
      return null;
    }
  }
}

export default MimeType;
