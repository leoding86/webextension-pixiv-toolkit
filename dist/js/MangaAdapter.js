_pumd.MangaAdatper = (function (window, ptk) {
    return function () {
        this.illustContext,

        this.mangaToolkit;

        this.inital = function (context) {
            let self = this;

            return new Promise(function (resolve) {
                self.parseContext(context).then(function () {
                    resolve();
                });
            });
        };

        this.parseContext = function (context) {
            let self = this;

            this.illustContext = {
                illustId: context.illustId,
                illustTitle: context.illustTitle,
                illustAuthor: context.userName,
                illustAuthorId: context.userId,
                illustAuthorAcount: context.userAccount
            }

            return new Promise(function (resolve, reject) {
                let xhr = new XMLHttpRequest();

                xhr.open('get', self.buildMetaUrl());

                xhr.onload = function () {
                    let response = JSON.parse(this.responseText);

                    if (response.error) {
                        reject();
                        return;
                    }

                    // Parse pages information here
                    self.illustContext.pages = response.body;

                    resolve(self.illustContext);
                }

                xhr.send();
            });
        };

        this.buildMetaUrl = function () {
            return '//www.pixiv.net/ajax/illust/' + this.illustContext.illustId + '/pages';
        };

        this.getToolkit = function () {
            if (this.mangaToolkit) {
                this.mangaToolkit.context = this.illustContext;
                return this.mangaToolkit;
            }

            return this.mangaToolkit = new ptk.Manga186(this.illustContext);
        };
    }
})(window, _pumd);