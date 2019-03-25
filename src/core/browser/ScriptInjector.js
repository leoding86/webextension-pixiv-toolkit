import browser from 'browser';

function ScriptInjector() {
    this.injectDetails = [];
    this.injectFiles = [];
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
                if (index == self.injectDetails.length - 1) {
                    browser.tabs.executeScript(tabId, detail, function () {
                        resolve();
                    });
                } else {
                    browser.tabs.executeScript(tabId, detail);
                }
            });
        });
    }
}

export default ScriptInjector;
