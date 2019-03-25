(function (browser) {
    'use strict';

    browser = browser && browser.hasOwnProperty('default') ? browser['default'] : browser;

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
                self.injectNovel();
            });
        },

        callMessageAction: function (action, options) {
            let methodName = action + 'Action';

            if (typeof this[methodName] === 'function') {
                this[methodName].apply(this, options);
            }
        },

        bindActionButton: function () {
            browser.browserAction.onClicked.addListener(function () {
                browser.tabs.create({
                    url: browser.runtime.getURL('./pages/index.html')
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
                    self.callMessageAction(message.action, [sender, sendResponse]);
                }
            });
        },

        /**
         * Message action
         */
        injectUgoiraAction: function (sender, sendResponse) {
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
            ]).inject(sender.tab.id);
        },

        injectNovel: function () {
            let self = this;

            browser.webRequest.onCompleted.addListener(function(details) {
                if (self.enableExtension && details.frameId === 0 && details.statusCode === 200) {
                    // console.log('Load noval app');

                    scriptFiles.forEach(function(scriptFile) {
                        browser.tabs.executeScript(details.tabId, {file: scriptFile});
                    });

                    browser.tabs.executeScript(details.tabId, {file: 'lib/js-epub-maker/js-epub-maker.min.js'});
                    browser.tabs.executeScript(details.tabId, {file: 'js/NovalAdapter.js'});
                    browser.tabs.executeScript(details.tabId, {file: 'js/190115/Noval.js'});
                }
            }, {
                urls: [
                    "*://*.pixiv.net/novel/show.php?id=*"
                ]
            });
        },

        update: function () {
            PackageFileReader.read('manifest.json', function (result) {
                var manifest = JSON.parse(result);
                var version = manifest.version;

                browser.storage.local.get(null, function (items) {
                    var updater = new Updater(items);

                    if (updater.isNewer(version)) {
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
                            enablePackUgoiraFramesInfo: true
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
                        });
                    }
                });
            });
        }
    };

    bootstrap_1(Main);

}(chrome));
