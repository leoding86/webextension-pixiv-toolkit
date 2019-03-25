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
                                    // console.log('ugoira type')
                                    self.injectUgoira(json.body);
                                }

                                resolve(json.body);
                            } else {
                                reject();
                            }
                        }
                    };

                    self.xhr.send();
                });
            },

            getIllustUrl: function (illustId) {
                return '//www.pixiv.net/ajax/illust/' + illustId;
            },

            injectUgoira: function (context) {
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
                            ugoiraAdapter.makeToolkit().run();
                        });

                        ptk.fence.put('ugoiraAdapter', ugoiraAdapter);
                    }, 1000);
                } else {
                    let ugoiraAdapter = ptk.fence.get('ugoiraAdapter');
                    ugoiraAdapter.inital(context).then(function (context) {
                        ugoiraAdapter.makeToolkit().destroy().run().show();
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