import browser from 'browser';

function PackageFileReader() {
    //
}

PackageFileReader.read = function (path, callback) {
    browser.runtime.getPackageDirectoryEntry(function (directoryEntry) {
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
