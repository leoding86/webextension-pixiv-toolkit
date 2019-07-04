import { Tabs } from '@/modules/Browser';

class ScriptInjector {

  constructor () {
    this.browserTabs = Tabs.getTabs();
    this.injectDetails = [];
    this.injectFiles = [];
    this.injectedFiles = [];
  }

  reset () {
    this.injectDetails = this.injectFiles = [];
    return this;
  }

  addInjectFiles (files) {
    let self = this;

    files.forEach((file) => {
      self.appendInjectDetail({
        file: file,
        runAt: 'document_end'
      })
    });

    return this;
  }

  appendInjectDetail (detail) {
    this.injectDetails.push(detail);
    return this;
  }

  inject (tabId) {
    let self = this;

    return new Promise(function (resolve) {
      self.injectDetails.forEach(function (detail, index) {
        if (self.injectedFiles.indexOf(detail.file) > -1) {
          return;
        }

        if (index == self.injectDetails.length - 1) {
          self.browserTabs.executeScript(tabId, detail, function () {
            resolve();
          });
        } else {
          self.browserTabs.executeScript(tabId, detail);
        }

        self.injectedFiles.push(detail.file);
      });
    });
  }
}

export default ScriptInjector;
