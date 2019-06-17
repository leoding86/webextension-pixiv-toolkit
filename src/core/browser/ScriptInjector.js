import browser from 'browser';

function ScriptInjector() {
    this.injectDetails = [];
    this.injectFiles = [];
    this.injectedFiles = [];
}

ScriptInjector.prototype = {
    reset: function () {
        this.injectDetails = [];
        this.injectFiles = [];
        return this;
    },

    addInjectFiles: function (files) {
        var self = this;

        files.forEach(function (file) {
            self.appendInjectDetail({
                file: file,
                runAt: 'document_end'
            });
        });

        return this;
    },

    appendInjectDetail: function (detail) {
        this.injectDetails.push(detail);
        return this;
    },

    inject: function (tabId, injectDetailIndex) {
        let self = this;

        return new Promise(function (resolve) {
            self.injectDetails.forEach(function (detail, index) {
                if (self.injectedFiles.indexOf(detail.file) > -1) {
                    return;
                }

                if (index == self.injectDetails.length - 1) {
                    browser.tabs.executeScript(tabId, detail, function () {
                        resolve();
                    });
                } else {
                    browser.tabs.executeScript(tabId, detail);
                }

                // console.log('inject file ' + detail.file);

                self.injectedFiles.push(detail.file);
            });
        });
    }
}

export default ScriptInjector;
