export default {
  computed: {
    browserItems() {
      return this.$root.globalBrowserItems || this.$root.browserItems;
    },

    isFirefox() {
      return this.$root.isFirefox_;
    }
  },

  methods: {
    tl(string) {
      return browser.i18n.getMessage(string);
    },

    stripTags(content, replace = ' ') {
      if (typeof content !== 'string') {
        return content;
      }

      return content.replace(/<\/?[^>]+(>|$)/g, replace.repeat(2)).trim();
    }
  }
}
