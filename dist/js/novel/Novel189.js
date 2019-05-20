_pumd.Novel189 = (function (window, ptk) {
  function NovelToolkit() {
    this.browser = ptk.getBrowser();

    this.context;

    this.container;

    this.wrapper;

    this.downloadBtn;

    this.epubMaker;

    this.toolkitWrapper;
  }

  NovelToolkit.prototype = {
    setContext: function (context) {
      this.context = context;
    },

    setContainer: function (container) {
      this.container = container;
    },

    init: function () {
      if (!this.wrapper) {
        this.createWrapper();
      }

      this.downloadNovel();
    },

    createWrapper: function () {
      var downloadBtn = this.createDownloadBtn();

      this.wrapper = document.createElement('div');
      this.wrapper.setAttribute('id', '__ptk-novel');
      this.wrapper.style = 'display:block;'
      downloadBtn.appendTo(this.wrapper);

      this.container.appendChild(this.wrapper);
      return;
    },

    createDownloadBtn: function () {
      this.downloadBtn = new ptk.Component.Button(ptk.common.lan.msg('download_novel'), 'background:#0096fa;color:#fff;padding:3px 5px;border-radius:3px;font-weight:700;font-size:12px;display:none');
      return this.downloadBtn;
    },

    hide: function () {
      console.log('hide');
      this.wrapper.remove();
      this.wrapper = null;
    },

    getEpubMaker: function () {
      return new EpubMaker()
        .withUuid(this.context.novelUrl)
        .withTemplate('idpf-wasteland')
        .withAuthor(this.context.novelUserName)
        .withAttributionUrl(this.context.novelUrl)
        .withCover(this.context.novelCover)
        .withTitle(this.context.novelTitle);
    },

    writeSections: function () {
      let self = this;

      this.context.novelSections.forEach(function (section) {
        self.epubMaker.withSection(
          new EpubMaker.Section('bodymatter', null, { content: section }, false, false)
        );
      });
    },

    downloadNovel: function () {
      let self = this;

      this.epubMaker = this.getEpubMaker();

      this.writeSections();

      this.epubMaker.downloadEpub(function (epubZipContent, filename) {
        let blob = URL.createObjectURL(epubZipContent);

        self.downloadBtn.el.style.display = 'inline';

        /**
         * Test chrome downloads and permissions apis
         */
        // self.downloadBtn.setAttribute('href', URL.createObjectURL(epubZipContent));
        self.downloadBtn.setProp('href', blob);
        self.downloadBtn.setProp('download', filename);

        // Click download button
        self.downloadBtn.onClickedListener(function () {
          ptk.browserUtils.storage.get(null).then(function (items) {
            // Check download setting
            if (items.enableExtTakeOverDownloads) {
              // Check if downloads permission is granted
              ptk.browserUtils.permissions.contains({
                permissions: ['downloads']
              }).then(function (result) {
                if (result) {
                  ptk.browserUtils.downloads.download({
                    url: blob,
                    filename: items.downloadRelativeLocation + filename
                  })
                } else {
                  alert('Pixiv Toolkit needs downloads permission, please grant permission in options page');
                }
                return;
              });
            } else {
              // download with link
              let download = document.createElement('a');
              download.setAttribute('href', blob);
              download.setAttribute('download', filename);
              download.click();
              download.remove();
            }
          });
        });
      });
    }
  }

  NovelToolkit.instance;

  NovelToolkit.getInstance = function (container, context) {
    if (!NovelToolkit.instance) {
      NovelToolkit.instance = new NovelToolkit();
    }

    NovelToolkit.instance.setContainer(container);
    NovelToolkit.instance.setContext(context);

    return NovelToolkit.instance;
  };

  return NovelToolkit;
})(window, _pumd);
