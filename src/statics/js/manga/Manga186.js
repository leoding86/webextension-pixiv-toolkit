_pumd.Manga186 = (function (window, ptk) {
  let browser = ptk.getBrowser();

  function MangaToolkit() {
    this.appWrapper;
    this.buttons;
  }

  MangaToolkit.prototype = {
    init: function () {
      let self = this;

      this.wrapper = document.createElement('div');
      this.wrapper.style = 'position:relative;width:580px;padding:10px;margin:16px auto;background:#eee;border-radius:5px;';

      let info = document.createElement('span');
      info.style = 'position:absolute;right:10px;bottom:5px;color:#ccc;';
      info.innerText = 'Pixiv Toolkit';
      this.wrapper.appendChild(info);

      this.guessButtonsContainer(function (appWrapper) {
        self.appWrapper = appWrapper;

        if (self.appWrapper) {
          self.appWrapper.insertBefore(self.wrapper, self.appWrapper.firstChild);
        } else {
          // console.log('ping');
          throw 'app wrapper not found';
        }
      });
    },

    run: function () {
      console.log('run');
      return this;
    },

    show: function () {
      console.log('show');
      return this;
    },

    reset: function () {
      console.log('reset');
      return this;
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
