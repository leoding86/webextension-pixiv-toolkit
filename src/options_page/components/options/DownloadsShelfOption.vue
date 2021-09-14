<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_disable_downloads_shelf') }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-switch v-model="disableDownloadsShelf"
        @change="onDisableDownloadsShelf"></v-switch>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {
  data() {
    return {
      disableDownloadsShelf: false,
    };
  },

  watch: {
    disableDownloadsShelf(val) {
      this.updateSettings({ disableDownloadsShelf: !!val });
    }
  },

  created() {
    this.disableDownloadsShelf = !!this.browserItems.disableDownloadsShelf;

    /**
     * If disableDownloadsShelf option value if true, then should check the browser has the necessary permissions.
     */
    if (this.browserItems.disableDownloadsShelf) {
      browser.permissions.contains({
        permissions: ['downloads', 'downloads.shelf']
      }, result => {
        this.disableDownloadsShelf = !!result;

        this.updateSettings({ disableDownloadsShelf: false });
      });
    }
  },

  methods: {
    updateSettings(settings) {
      browser.storage.local.set(settings);
    },

    onDisableDownloadsShelf(val) {
      if (val === true) {
        browser.permissions.request({
          permissions: ['downloads', 'downloads.shelf']
        }, result => {
          this.disableDownloadsShelf = !!result;
        });
      } else {
        this.disableDownloadsShelf = false;
      }
    }
  }
}
</script>
