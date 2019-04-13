_pumd.Manga186 = (function (window, ptk) {
  let browser = ptk.getBrowser();

  function MangaToolkit(context) {
    this.context = context;
    this.extensionItems;
    this.appWrapper;
    this.buttons;
    this.retryTicker;
    this.splitSize;
    this.chunks;
    this.zips;
  }

  MangaToolkit.prototype = {
    init: function () {
      let self = this;

      this.wrapper = document.createElement('div');
      this.wrapper.style = 'position:relative;width:480px;padding:10px;padding-right:100px;margin:16px auto;background:#f9f9f9;border-radius:5px;';

      let info = document.createElement('span');
      info.style = 'position:absolute;right:10px;bottom:5px;color:#ccc;';
      info.innerText = 'Pixiv Toolkit';
      this.wrapper.appendChild(info);

      return new Promise(function (resolve, reject) {
        self.guessButtonsContainer(function (appWrapper) {
          self.appWrapper = appWrapper;

          if (self.appWrapper) {
            self.appWrapper.insertBefore(self.wrapper, self.appWrapper.firstChild);
            resolve();
          } else {
            // console.log('ping');
            reject('app wrapper not found');
          }
        });
      });
    },

    run: function () {
      let self = this;
      let startIndex = 0;

      this.retryTicker = new ptk.RetryTicker();
      this.splitSize = 99;
      this.buttons = [];
      this.chunks = [];
      this.zips = [];

      while (startIndex <= this.context.pages.length - 1) {
        let chunk = {};
        chunk.start = startIndex;

        let endIndex = startIndex + self.splitSize - 1;

        if (endIndex >= self.context.pages.length) {
          endIndex = self.context.pages.length - 1;
        }

        chunk.end = endIndex;

        self.chunks.push(chunk);

        startIndex = chunk.end + 1;
      }

      return new Promise(function (resolve) {
        ptk.common.storage.get(null, function (extensionItems) {
          if (!extensionItems.mangaImageRenameFormat ||
            extensionItems.mangaImageRenameFormat.indexOf('{pageNum}') < 0
          ) {
            extensionItems.mangaImageRenameFormat += '{pageNum}';
          }

          self.extensionItems = extensionItems;

          // Append buttons to app container
          self.chunks.forEach(function (chunk) {
            self.appendButton(chunk);
          });

          resolve();
        });

        console.log('run');

      });
    },

    getPageRange: function (chunk) {
      if (chunk.start == chunk.end) {
        return parseInt(chunk.start);
      } else {
        return (parseInt(chunk.start + 1)) + '-' + (parseInt(chunk.end + 1));
      }
    },

    appendButton: function (chunk) {
      let self = this;
      let pageRange = this.getPageRange(chunk);
      let fileName = ptk.common.formatName(this.extensionItems.mangaRenameFormat, this.context, this.context.illustId) + '_' + pageRange + '.zip';
      let button = new ptk.Component.Button(
        ptk.common.lan.msg('download_page__short') + ' ' + pageRange,
        'display:inline-block;width:150px;margin:0 5px 5px 0;background-color: #0096fa;border: none;border-radius: 16px;color: #fff;cursor: pointer;font-size: 12px;font-weight: 700;line-height: 1;padding: 8px 0;text-align: center;transition: background-color .2s;cursor:pointer;'
      );
      button.onClickedListener(function () {
        if (this.getProp('complete')) {
          return;
        }

        if (this.getProp('downloading')) {
          alert(ptk.common.lan.msg('waitDownload'));
          return;
        }

        // download pages and pack into zip
        let button = this;

        let oldText = this.el.innerText;

        this.setText(ptk.common.lan.msg('pending'));

        this.setProp('downloading', true);

        let zip = this.setProp('zip', new JSZip());

        let queue = this.setProp('queue', new ptk.Queue());

        let xhr = this.setProp('xhr', new XMLHttpRequest());

        queue.onItemComplete = function () {
          button.el.innerText = 'C:' + queue.complete + ' / F:' + queue.fail + ' / T:' + queue.total;
        }

        queue.onItemFail = function () {
          button.el.innerText = 'C:' + queue.complete + ' / F:' + queue.fail + ' / T:' + queue.total;
        }

        queue.onDone = function () {
          zip.generateAsync({
            type: 'blob',
          }).then(function (blob) {
            button.setProp('complete', true);
            button.setAttribute('download', fileName);
            button.setAttribute('href', URL.createObjectURL(blob));
            button.setText(common.lan.msg('save_page') + ' ' + pageRange);
            button.setProp('download', false);
          });
        }

        for (var i = chunk.start; i <= chunk.end; i++) {
          queue.add(self.context.pages[i].urls.original);
        }

        queue.start(function (url) {
          return new Promise(function (resolve, reject) {
            self.saveImage(xhr, url, zip).then(function () {
              resolve();
            }).catch(function (e) {
              console.log(e);
              reject();
            });
          });
        });
      });

      // Append button to app container
      button.appendTo(this.wrapper);

      // Add button object to buttons property
      this.buttons.push(button);
    },

    show: function () {
      this.wrapper.style.display = 'block';

      return this;
    },

    reset: function () {
      // Hide wrapper
      this.wrapper.style.display = 'none';
      ptk.common.console.log('hide wrapper');

      // Abort all xhr requests and download queue, and remove button
      this.buttons.forEach(function (button) {
        let queue = button.getProp('queue');

        if (queue) {
          queue.abort();
        }

        let xhr = button.getProp('xhr');

        if (xhr) {
          xhr.abort();
        }

        button.destroy();

        ptk.common.console.log('Abort download queue, xhr and remove button');
      });

      return this;
    },

    /**
     * Download image and save it to zip
     * @param {XMLHttpRequest} xhr
     * @param {string} url 
     * @param {JSZip} zip 
     */
    saveImage: function (xhr, url, zip) {
      let self = this;

      return new Promise(function (resolve, reject) {
        xhr.open('get', url);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.onload = function () {
          var pageNum = this.responseURL.match(/\d+\.[^.]+$/)[0];
          self.context.pageNum = pageNum;

          let fileName = common.formatName(
            self.extensionItems.mangaImageRenameFormat,
            self.context,
            pageNum
          );
          zip.file(fileName, this.responseText, {
            binary: true
          });
          resolve();
        };
        xhr.onerror = function () {
          if (!retryTicker.reachLimit()) {
            resolve(self.saveImage(xhr, url, zip));
          } else {
            reject();
          }
        };
        xhr.send();
      })
    },

    guessButtonsContainer: function (callback) {
      let self = this;

      let timeout = setTimeout(function () {
        common.console.log('Guessing wrapper');

        let wrapper = document.querySelector('article figcaption') ||
          document.querySelector('article figure') ||
          document.querySelector('figcaption');

        if (!wrapper) {
          self.guessButtonsContainer(callback);
        } else {
          common.console.log('App wrapper found');
          callback.call(self, wrapper);
        }
      }, 1000);
    },
  };

  return MangaToolkit;
})(window, _pumd);
