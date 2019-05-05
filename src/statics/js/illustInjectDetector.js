(function (window, browser, ptk) {
    if (ptk && ptk.fence.has('ugoiraAdapter')) {
        // console.log('ugoira adapter injected');
    } else {
        // console.log('inject detector');

        function DetermineInjectType() {
            this.xhr = new XMLHttpRequest();
        }

        DetermineInjectType.ILLUST_TYPE = 0;
        DetermineInjectType.MANGA_TYPE = 1;
        DetermineInjectType.UGOIRA_TYPE = 2;

        DetermineInjectType.prototype = {
            inject: function (url) {
                let self = this;

                // Reset current toolkit
                let currentToolkit = ptk.fence.get('currentToolkit');

                if (currentToolkit) {
                    this.reset(currentToolkit);
                }

                if (this.xhr) {
                    this.xhr.abort();
                }

                return new Promise(function (resolve, reject) {
                    let matches;
                    let illustId;

                    if (matches = url.match(/illust_id=(\d+)/)) {
                        illustId = matches[1];
                    } else {
                        reject('Not found illust id in url');
                        return;
                    }

                    self.xhr.open('GET', self.getIllustUrl(illustId));

                    self.xhr.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            let json = JSON.parse(this.responseText);

                            if (json && json.body) {
                                if (json.body.illustType === DetermineInjectType.UGOIRA_TYPE) {
                                    common.console.log('ugoira type');
                                    self.injectUgoira(json.body);
                                } else if (json.body.illustType === DetermineInjectType.MANGA_TYPE) {
                                    common.console.log('inject manga');
                                    self.injectManga(json.body);
                                } else if (json.body.illustType === DetermineInjectType.ILLUST_TYPE) {
                                    common.console.log('inject illust');
                                    self.injectManga(json.body);
                                }

                                resolve(json.body);

                                return;
                            }

                            browser.sendMessage({
                              action: 'deactiveIcon'
                            });

                            reject();

                            return;
                        }
                    };

                    self.xhr.send();
                });
            },

            reset: function (toolkit) {
                try {
                    toolkit.reset();
                } catch (e) {
                    toolkit.destroy();
                }
            },

            getIllustUrl: function (illustId) {
                return '//www.pixiv.net/ajax/illust/' + illustId;
            },

            injectUgoira: function (context) {
                // update action icon to active
                browser.runtime.sendMessage({
                  action: 'activeIcon'
                });

                ptk.fence.put('ugoiraContext', context);
                // console.log('inject ugoira')

                if (!ptk.fence.has('ugoiraAdapter')) {
                    browser.runtime.sendMessage({
                        action: 'injectUgoira'
                    });

                    /**
                     * Cannot sure scripts loaded, must wait for a long time to make sure it happened
                     * browser.runtime.sendMessage api's sendResponse is not working sometime.
                     */
                    setTimeout(function () {
                        let ugoiraAdapter = new ptk.UgoiraAdapter();
                        ugoiraAdapter.inital(context).then(function (context) {
                            // store toolkit to current toolkit
                            ptk.fence.put('currentToolkit', ugoiraAdapter.makeToolkit());

                            ugoiraAdapter.makeToolkit().run();
                        });

                        ptk.fence.put('ugoiraAdapter', ugoiraAdapter);
                    }, 1000);
                } else {
                    let ugoiraAdapter = ptk.fence.get('ugoiraAdapter');

                    // store toolkit to current toolkit
                    ptk.fence.put('currentToolkit', ugoiraAdapter.makeToolkit());

                    ugoiraAdapter.inital(context).then(function (context) {
                        ugoiraAdapter.makeToolkit().run().show();
                    });
                }
            },

            injectManga: function (context) {
                // update action icon to active
                browser.runtime.sendMessage({
                  action: 'activeIcon'
                });

                if (!ptk.fence.has('mangaAdapter')) {
                    browser.runtime.sendMessage({
                        action: 'injectManga'
                    });

                    setTimeout(function () {
                        let mangaAdapter = new ptk.MangaAdatper();
                        mangaAdapter.inital(context).then(function (context) {
                            let mangaToolkit = mangaAdapter.getToolkit();

                            // store toolkit to current toolkit
                            ptk.fence.put('currentToolkit', mangaToolkit);

                            mangaToolkit.init().then(function () {
                                mangaToolkit.run();
                            });
                        });

                        ptk.fence.put('mangaAdapter', mangaAdapter);
                    }, 1000);
                } else {
                    let mangaAdapter = ptk.fence.get('mangaAdapter');
                    mangaAdapter.inital(context).then(function (context) {
                        let mangaToolkit = mangaAdapter.getToolkit();

                        // store toolkit to current toolkit
                        ptk.fence.put('currentToolkit', mangaToolkit);

                        mangaToolkit.run().then(function () {
                            mangaToolkit.show();
                        });
                    });
                }
            },

            isType: function (type) {
                return this.isType === type;
            }
        }

        let currentHref = window.location.href;
        let body = document.querySelector('body');
        let config = { attributes: true, childList: true, subtree: true };
        let determineInjectType = new DetermineInjectType();

        // console.log('Create DetermineInjectType instance');

        determineInjectType.inject(currentHref).then(function (result) {
            //
        }).catch(function (error) {
            throw error;
        });

        let observer = new MutationObserver(function (mutationsList, observer) {
            if (window.location.href !== currentHref) {
                // hide toolkits
                if (ptk.fence.has('ugoiraAdapter')) {
                    ptk.fence.get('ugoiraAdapter').makeToolkit().hide();
                }

                currentHref = window.location.href;

                determineInjectType.inject(currentHref).then(function (result) {
                    //
                }).catch(function (error) {
                    throw error;
                });
            }
        });

        observer.observe(body, config);
    }
})(window, chrome, window._pumd);
