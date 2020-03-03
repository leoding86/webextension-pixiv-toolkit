import Browser from '@/modules/Browser/Browser';

class PackageFileReader {
  static read(path, callback, errorCallback) {
    Browser.getBrowser().runtime.getPackageDirectoryEntry(directoryEntry => {
      directoryEntry.getFile(path, undefined, fileEntry => {
        fileEntry.file(file => {
          let reader = new FileReader;
          reader.addEventListener("load", event => {
            callback(reader.result);
          });
          reader.readAsText(file);
        });
      }, error => {
        errorCallback(error);
      });
    });
  }
}

export default PackageFileReader;
