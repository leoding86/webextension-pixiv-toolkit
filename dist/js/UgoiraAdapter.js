_pumd.UgoiraAdapter = (function (window, ptk) {
    function UgoiraAdapter() {
        // this.illustTitle;
        // this.illustAuthor;
        // this.illustId;
        // this.illustAuthorId;
        // this.illustFrames;
        // this.illustSrc;
        // this.illustOriginalSrc;
        // this.illustMimeType;
        // this.illustDuration = 0;
        this.illustContext = {};
        this.ugoiraToolkit;
    }

    UgoiraAdapter.toolkitClass = 'Ugoira190313';

    UgoiraAdapter.prototype = {
        inital: function (context) {
            let self = this;

            return new Promise((function(resolve, reject) {
                chrome.storage.local.get(null, function (items) {
                    window.cr = {
                        storage: items
                    };

                    // let pixivContext = ptk.common.getTargetPageVar('globalInitData.preload', 'object');

                    // if (!pixivContext) {
                    //     reject();
                    //     return;
                    // }

                    self.parseContext(context).then(function (context) {
                        resolve(context);
                    }).catch(function () {
                        reject();
                    });
                });
            }).bind(this));
        },

        /**
         * illustId
         * illustTitle
         * illustAuthor
         * illustAuthorId
         * illustSrc
         * illustOriginalSrc
         * illustFrames
         * illustMimeType
         * illustDuration
         */
        parseContext: function (context) {
            let self = this;
            let adapter = {};

            this.illustContext = {
                illustId: context.illustId,
                illustTitle: context.illustTitle,
                illustAuthor: context.userName,
                illustAuthorId: context.userId,
                illustAuthorAcount: context.userAccount
            }

            return new Promise((function (resolve, reject) {
                let xhr = new XMLHttpRequest();
                xhr.open('get', self.buildMetaUrl(self.illustContext.illustId));
                xhr.onload = function () {
                    let response = JSON.parse(this.responseText);

                    if (response.error) {
                        reject();
                        return;
                    }

                    self.illustContext.illustSrc = response.body.src;
                    self.illustContext.illustOriginalSrc = response.body.originalSrc;
                    self.illustContext.illustFrames = response.body.frames;
                    self.illustContext.illustMimeType = response.body.mime_type;

                    let duration = 0

                    self.illustContext.illustFrames.forEach(function (frame) {
                        duration += --frame.delay;
                    });

                    self.illustContext.illustDuration = duration;

                    resolve(self.illustContext);
                };
                xhr.send();
            }));
        },

        buildMetaUrl: function (illustId) {
            return '//www.pixiv.net/ajax/illust/' + illustId + '/ugoira_meta';
        },

        makeToolkit: function () {
            if (this.ugoiraToolkit) {
                this.ugoiraToolkit.context = this.illustContext;
                return this.ugoiraToolkit;
            }

            return this.ugoiraToolkit = new ptk.Ugoira190313(this.illustContext);
        }
    }

    return UgoiraAdapter;
})(window, _pumd);
