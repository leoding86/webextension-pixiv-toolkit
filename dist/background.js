(function (browser) {
    'use strict';

    browser = browser && browser.hasOwnProperty('default') ? browser['default'] : browser;

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

                    console.log('inject file ' + detail.file);
                    
                    self.injectedFiles.push(detail.file);
                });
            });
        }
    };

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
    };

    var versionCompare = function (v1, v2, options) {
        var lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend,
            v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) v1parts.push("0");
            while (v2parts.length < v1parts.length) v2parts.push("0");
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i) {
                return 1;
            }

            if (v1parts[i] == v2parts[i]) {
                continue;
            }
            else if (v1parts[i] > v2parts[i]) {
                return 1;
            }
            else {
                return -1;
            }
        }

        if (v1parts.length != v2parts.length) {
            return -1;
        }

        return 0;
    };

    var versionCompare_1 = versionCompare;

    function Updater(currentSettings) {
        this.currentSettings = currentSettings,
        this.defaultSettings;
    }

    Updater.prototype = {
        setDefaultSettings: function (defaultSettings) {
            this.defaultSettings = defaultSettings;
            return this;
        },

        removeSettings: function (settingsNeededRemoved) {
            browser.storage.local.remove(settingsNeededRemoved);
        },

        mergeSettings: function (callback) {
            var self = this;

            Object.keys(this.defaultSettings).forEach(function (key) {
                if (undefined === self.currentSettings[key]) {
                    self.currentSettings[key] = self.defaultSettings[key];
                }
            });

            this.storageSettings(this.currentSettings, callback);
        },

        updateSetting: function (setting, callback) {
            this.storageSettings(setting, callback);
        },

        storageSettings: function (settings, callback) {
            let self = this;

            browser.storage.local.set(settings, function () {
                callback.call(self);
            });
        },

        isNewer: function (version) {
            return !this.currentSettings.version || versionCompare_1(this.currentSettings.version, version) < 0
        }
    };

    function bootstrap(App) {
        if (App && typeof App.prototype.run === 'function') {
            (new App).run();
        }
    }

    var bootstrap_1 = bootstrap;

    function Main() {
        // constructor
        this.enableExtension = false;
    }

    Main.prototype = {
        run: function () {
            let self = this;

            browser.storage.local.get(null, function (items) {
                // self.enableExtension = items.enableExtension;
                self.enableExtension = true;

                self.update();
                self.bindActionButton();
                self.listenStorageChanged();
                self.listenMessage();
            });
        },

        callMessageAction: function (action, args) {
            let methodName = action + 'Action';

            if (typeof this[methodName] === 'function') {
                this[methodName].call(this, args);
            }
        },

        bindActionButton: function () {
            browser.browserAction.onClicked.addListener(function () {
                browser.browserAction.getBadgeText({}, function (text) {
                  let url = './pages/index.html';

                  if (!!text) {
                    url += '#/history';
                  }

                  browser.browserAction.setBadgeText({
                    text: ''
                  }, function () {
                    browser.tabs.create({
                      url: browser.runtime.getURL(url)
                    });
                  });
                });
            });
        },

        listenStorageChanged: function () {

            browser.storage.onChanged.addListener(function (changes, areaName) {
                if (changes.enableExtension) ;
            });
        },

        listenMessage: function () {
            let self = this;

            browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                if (message.action) {
                    // self.callMessageAction(message.action, [sender, sendResponse]);
                    self.callMessageAction(message.action, {
                      message: message,
                      sender: sender,
                      sendResponse: sendResponse
                    });
                }

                /**
                 * Prevent "The message port closed before a response was received" error
                 */
                return true;
            });
        },

        /**
         * Message action
         */
        injectUgoiraAction: function (args) {
            if (!this.enableExtension) {
                return;
            }

            var scriptInjector = new ScriptInjector();

            scriptInjector.addInjectFiles([
                'lib/jszip/jszip.js',
                'lib/gifjs/gif.js',
                'lib/whammy.js',
                // 'js/ugoira.js',
                'js/UgoiraAdapter.js',
                // 'js/180607/ugoira.js'
                'js/ugoira/ugoira190313.js'
            ]).inject(args.sender.tab.id);
        },

        injectMangaAction: function (args) {
            var scriptInjector = new ScriptInjector();

            scriptInjector.addInjectFiles([
                "lib/jszip/jszip.js",
                "js/MangaAdapter.js",
                "js/manga/Manga186.js"
            ]).inject(args.sender.tab.id);
        },

        /**
         * Update action icon
         */
        activeIconAction: function (args) {
          browser.browserAction.setIcon({
            path: browser.runtime.getURL('./icon_active.png'),
            tabId: args.sender.tab.id
          });
        },

        deactiveIconAction: function (args) {
          browser.browserAction.setIcon({
            path: browser.runtime.getUrl('./icon.png'),
            tabId: args.sender.tab.id
          });
        },

        /**
         * Request permissions and send result back
         * @param {Object} args
         */
        requestPermissionsAction: function (args) {
          browser.permissions.request(args.message.permissions, function (granted) {
            if (!!args.sendResponse && typeof args.sendResponse === 'function') {
              args.sendResponse(granted);
            }
          });
        },

        /**
         * Remove permissions and send result back
         * @param {Object} args
         */
        removePermissionsAction: function (args) {
          browser.permissions.remove(args.message.permissions, function (removed) {
            if (!!args.sendResponse && typeof args.sendResponse === 'function') {
              args.sendResponse(removed);
            }
          });
        },

        /**
         * Check if extension has permissions
         * @param {Object} args
         */
        containsPermissionsAction: function (args) {
          browser.permissions.contains(args.message.permissions, function (result) {
            if (!!args.sendResponse && typeof args.sendResponse === 'function') {
              args.sendResponse(result);
            }
          });
        },

        /**
         * Download things
         * @param {Object} args
         */
        downloadAction: function (args) {
          browser.downloads.download(args.message.options, function (downloadId) {
            if (!!args.sendResponse && typeof args.sendResponse === 'function') {
              args.sendResponse(downloadId);
            }
          });
        },

        update: function () {
            PackageFileReader.read('manifest.json', function (result) {
                var manifest = JSON.parse(result);
                var version = manifest.version;

                browser.storage.local.get(null, function (items) {
                    var updater = new Updater(items);

                    if (updater.isNewer(version)) {
                        console.log('update');
                        updater.setDefaultSettings({
                            version: version,
                            enableExtend: false,
                            enableWhenUnderSeconds: 1,
                            extendDuration: 3,

                            ugoiraRenameFormat: '',
                            mangaRenameFormat: '',
                            mangaImageRenameFormat: '',

                            enableExtension: true,

                            /**
                             * @version 1.8.5
                             * Pack ugoira frames info to zip file
                             */
                            enablePackUgoiraFramesInfo: true,

                            /**
                             * @version 1.8.8
                             * Set manga page chunk
                             */
                            mangaPagesInChunk: 99,

                            /**
                             * @version 2.0.2
                             */
                            ugoiraGenerateAndDownload: false,
                            mangaPackAndDownload: false,

                            /**
                             * @version 2.0.3
                             */
                            enableExtTakeOverDownloads: false,
                            downloadRelativeLocation: null,
                            showHistoryWhenUpdateCompleted: true
                        });

                        updater.removeSettings([
                            'metasConfig',
                            'mangaMetasConfig',
                            'mangaImageNamePrefix',
                            'mangaImagesMetasConfig'
                        ]);

                        updater.mergeSettings(function () {
                            updater.updateSetting({
                                version: version
                            }, function () {
                                // console.log('update complete. version: ' + version);
                            });

                            if (items.showHistoryWhenUpdateCompleted) {
                              // Open change history
                              browser.tabs.create({
                                  url: browser.runtime.getURL('./pages/index.html') + '#/history'
                              });
                            } else {
                              // Mark new on badge
                              browser.browserAction.setBadgeText({
                                text: 'NEW'
                              });

                              browser.browserAction.setBadgeBackgroundColor({
                                color: '#FF0000'
                              });
                            }
                        });
                    }
                });
            });
        }
    };

    bootstrap_1(Main);

}(chrome));
