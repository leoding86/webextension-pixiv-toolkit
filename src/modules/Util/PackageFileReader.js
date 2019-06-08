import Browser from '@/modules/Browser/Browser';

function PackageFileReader() {
    //
}

PackageFileReader.read = function (path, callback) {
    Browser.getBrowser().runtime.getPackageDirectoryEntry(function (directoryEntry) {
        directoryEntry.getFile(path, undefined, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader;
                reader.addEventListener("load", function (event) {
                    callback(reader.result);
                });
                reader.readAsText(file);
            });
        });
    });
}

export default PackageFileReader;
