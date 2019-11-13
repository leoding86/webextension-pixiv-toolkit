<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Others') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Activate_download_panel_automatically') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('Download_panel_will_show_up_automatically_when_page_loaded') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="autoActivateDownloadPanel"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";

export default {
  mixins: [SuperMixin],

  data() {
    return {
      autoActivateDownloadPanel: false
    };
  },

  beforeMount() {
    this.autoActivateDownloadPanel = this.browserItems.autoActivateDownloadPanel;
  },

  watch: {
    autoActivateDownloadPanel(val) {
      browser.storage.local.set({
        autoActivateDownloadPanel: !!val
      });
    }
  }
};
</script>
