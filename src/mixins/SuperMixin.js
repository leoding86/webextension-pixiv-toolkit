export default {
  computed: {
    browserItems() {
      return this.$root.globalBrowserItems || this.$root.appSettings;
    },

    isFirefox() {
      return this.$root.isFirefox_;
    },

    $_browser() {
      return window.$_browser;
    }
  },

  methods: {
    tl(string) {
      return this.$t(`${string}.message`);
    },

    stripTags(content, replace = ' ') {
      if (typeof content !== 'string') {
        return content;
      }

      return content.replace(/<\/?[^>]+(>|$)/g, replace.repeat(2)).trim();
    },

    routeTo (name) {
      this.pushRoute({
        name: name
      })
    },

    pushRoute(args) {
      return this.$router.push(args).then(() => {
        return Promise.resolve();
      }).catch(error => {
        if (error.name === 'NavigationDuplicated') {
          // ignore
          return;
        }

        return Promise.reject(error);
      });
    }
  }
}
