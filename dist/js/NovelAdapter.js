_pumd.NovelAdapter = (function(window, ptk) {
    console.log('Load novel toolkit');

    function NovelAdapter() {
      this.rawContext;

      this.context;

      this.observer;

      this.container;

      this.requestNovelDataXhr;

      this.currentHref;

      this.currentNovelId;

      this.containerSelector = 'main section h1';

      this.init();
    }

    NovelAdapter.novelToolkitInstance = null;

    NovelAdapter.prototype = {
      init: function () {
        this.currentHref = window.location.href;

        this.currentNovelId = this.getCurrentNovelId();

        this.initObserver();
      },

      getCurrentNovelId: function () {
        let matches = this.currentHref.match(/^https?:\/\/(?:www\.)?pixiv\.net\/novel\/show\.php\?id=(\d+)/);
        return matches[1];
      },

      initObserver: function () {
        var self = this;

        this.observer = new MutationObserver(function (mutationsList, observer) {
          if (window.location.href !== self.currentHref) {

            console.log(mutationsList);
              self.currentHref = window.location.href;

              let newNovelId = self.getCurrentNovelId();

              if (self.currentNovelId == newNovelId) {
                return;
              }

              self.currentNovelId = newNovelId;

              // Hide toolkit
              var novelToolkit = self.getNovelInstance();
              novelToolkit.hide();

              // Check location href
              if (/^https?:\/\/(?:www\.)?pixiv\.net\/novel\/show\.php\?id=\d+/.test(self.currentHref)) {
                self.requestNovelData().then(function () {
                  self.getToolkitContainer(function () {
                    novelToolkit = self.getNovelInstance();
                    novelToolkit.init();
                  });
                });
              }
          }
        });

        this.observer.observe(document.querySelector('body'), { attributes: true, childList: true, subtree: true });
      },

      requestNovelData: function () {
        var self = this;

        return new Promise(function (resolve) {
          if (!self.requestNovelDataXhr) {
            self.requestNovelDataXhr = new XMLHttpRequest();
          }

          self.requestNovelDataXhr.open('GET', '//www.pixiv.net/ajax/novel/' + self.currentNovelId);
          self.requestNovelDataXhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              var json = JSON.parse(this.responseText);

              if (json && json.body) {
                self.rawContext = json.body;
                self.parseNovelContext();

                resolve();
                return;
              }
            }
          }
          self.requestNovelDataXhr.send();
        });
      },

      parseNovelContext: function () {
        let sectionContents = this.rawContext.content.split(/[\r\n|\r|\n]\[newpage\][\r\n|\r|\n]/);

        let newSectionContents = sectionContents.map(function (content) {
          var newContent = content.replace(/[\r\n|\r|\n]/g, '<br />');
          return newContent;
        });

        this.context = {
          novelUrl: this.currentHref,
          novelId: this.rawContext.id,
          novelTitle: this.rawContext.title,
          novelUserId: this.rawContext.userId,
          novelUserName: this.rawContext.userName,
          novelSections: newSectionContents,
          novelDescription: this.rawContext.description,
          novelCover: this.rawContext.coverUrl
        }
      },

      getNovelInstance: function () {
        return ptk.Novel189.getInstance(this.container, this.context);
      },

      getToolkitContainer: function (callback) {
        var self = this;
        var container = document.querySelector(this.containerSelector);

        if (container && container.offsetWidth) {
          // while (container.parentElement) {
          //   let style = window.getComputedStyle(container.parentElement);

          //   if (style.display == 'none') {
          //     setTimeout(function () {
          //       self.getToolkitContainer(callback);
          //     }, 1000);
          //     return;
          //   }
          // }

          this.container = container;
          callback.call(this);
          return;
        }

        setTimeout(function () {
          self.getToolkitContainer(callback);
        }, 1000);
      }
    };

    var novelAdapter = new NovelAdapter();

    novelAdapter.requestNovelData().then(function () {
      novelAdapter.getToolkitContainer(function () {
        var novelToolkit = novelAdapter.getNovelInstance();
        novelToolkit.init();
      });
    });
})(window, _pumd);
