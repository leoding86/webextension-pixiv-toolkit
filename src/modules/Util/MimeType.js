class MimeType {
  static types = {
    'image/png'       : 'png',
    'image/apng'      : 'apng',
    'image/gif'       : 'gif',
    'image/jpeg'      : 'jpeg',
    'image/jpeg'      : 'jpg',
    'image/webp'      : 'webp',
    'text/plain'      : 'txt',
    'text/html'       : 'html',
    'video/webm'      : 'webm',
    'video/mp4'       : 'mp4',
    'application/json': 'json',
    'application/zip' : 'zip',
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

  static getMimeType(ext) {
    let targetType = '';

    Object.keys(MimeType.types).forEach(type => {
      if (MimeType.types[type] === ext) {
        targetType = type;
      }
    });

    return targetType;
  }

  /**
   *
   * @param {string} file
   * @returns {string}
   */
  static getFileMimeType(file) {
    return MimeType.getMimeType(MimeType.getFileExtension(file));
  }

  /**
   *
   * @param {string} file
   * @returns {string}
   */
  static getFileExtension(file) {
    return file.substr(file.lastIndexOf('.') + 1);
  }
}

export default MimeType;
