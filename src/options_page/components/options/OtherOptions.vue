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
            <v-list-tile-title>Enable save visit history</v-list-tile-title>
            <v-list-tile-sub-title>Enable/Disable save visit history</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableSaveVisitHistory"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Do not save NSFW work to history</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="notSaveNSFWWorkInHistory"
              :disabled="!enableSaveVisitHistory"></v-switch>
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
import SuperMixin from '@/mixins/SuperMixin';

export default {
  mixins: [
    SuperMixin
  ],

  data() {
    return {
      showHistoryWhenUpdateCompleted: true,
      autoActivateDownloadPanel: false,
      enableSaveVisitHistory: true,
      notSaveNSFWWorkInHistory: false
    };
  },

  beforeMount() {
    this.showHistoryWhenUpdateCompleted = this.browserItems.showHistoryWhenUpdateCompleted;
    this.autoActivateDownloadPanel = this.browserItems.autoActivateDownloadPanel;
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;
    this.notSaveNSFWWorkInHistory = this.browserItems.notSaveNSFWWorkInHistory;
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
    },

    enableSaveVisitHistory(val) {
      browser.storage.local.set({
        enableSaveVisitHistory: !!val
      });
    },

    notSaveNSFWWorkInHistory(val) {
      browser.storage.local.set({
        notSaveNSFWWorkInHistory: !!val
      });
    }
  }
};
</script>
