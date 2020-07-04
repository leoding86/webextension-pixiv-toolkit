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

    let parts = [];

    if (mimeType.indexOf('; ') > -1) {
      parts = mimeType.split('; ');
    } else {
      parts = [mimeType];
    }

    for (let i = 0, l = parts.length; i < l; i++) {
      if (MimeType.types[parts[i]]) {
        return MimeType.types[parts[i]];
      }
    }

    return null;
  }
}

export default MimeType;
