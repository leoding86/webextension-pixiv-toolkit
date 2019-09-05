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
import cr from "@@/modules/cr";
import { Storage as BrowserStorage } from "@/modules/Browser";

export default {
  data() {
    return {
      browserStorage: BrowserStorage.getInstance(),
      showHistoryWhenUpdateCompleted: browserItems.showHistoryWhenUpdateCompleted,
      autoActivateDownloadPanel: browserItems.autoActivateDownloadPanel,
      enableSaveVisitHistory: browserItems.enableSaveVisitHistory
    };
  },

  mounted() {
    console.log(window.browserItems);
  },

  watch: {
    autoActivateDownloadPanel(val) {
      this.browserStorage.set({
        autoActivateDownloadPanel: !!val
      });
    },

    showHistoryWhenUpdateCompleted(val) {
      this.browserStorage.set({
        showHistoryWhenUpdateCompleted: !!val
      });
    },

    enableSaveVisitHistory(val) {
      this.browserStorage.set({
        enableSaveVisitHistory: !!val
      });
    }
  },

  methods: {
    tl(string) {
      return cr._e(string);
    }
  }
};
</script>
