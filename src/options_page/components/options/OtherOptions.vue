<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Others') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Activate download panel automatically</v-list-tile-title>
            <v-list-tile-sub-title>Download panel will show up automatically when page loaded</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="autoActivateDownloadPanel"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_show_history_when_update_completed') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="showHistoryWhenUpdateCompleted"></v-switch>
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
      showHistoryWhenUpdateCompleted: true,
      autoActivateDownloadPanel: false
    };
  },

  beforeMount() {
    this.showHistoryWhenUpdateCompleted = this.browserItems.showHistoryWhenUpdateCompleted;
    this.autoActivateDownloadPanel = this.browserItems.autoActivateDownloadPanel;
  },

  watch: {
    autoActivateDownloadPanel(val) {
      browser.storage.local.set({
        autoActivateDownloadPanel: !!val
      });
    },

    showHistoryWhenUpdateCompleted(val) {
      browser.storage.local.set({
        showHistoryWhenUpdateCompleted: !!val
      });
    }
  }
};
</script>
