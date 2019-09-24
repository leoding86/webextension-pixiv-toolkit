export default {
  computed: {
    browserItems() {
      return this.$root.$data.browserItems;
    }
  },

  methods: {
    tl(string) {
      return browser.i18n.getMessage(string);
    }
  }
}
