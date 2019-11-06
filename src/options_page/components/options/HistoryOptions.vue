<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('History') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Enable_save_visit_history') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('Enable_Disable_save_visit_history') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableSaveVisitHistory"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Do_not_save_NSFW_work_to_history') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="notSaveNSFWWorkInHistory" :disabled="!enableSaveVisitHistory"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('clear_history_data') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('clear_history_data_cannot_be_reversed') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn @click="confirmDialog = true">{{ tl('Clear') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>

    <v-dialog v-model="confirmDialog" width="500">
      <v-card>
        <v-card-title>{{ tl('clear_history_data') }}</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">This operation cannot be reversed, are you sure?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="clearHistory" color="error">{{ tl('Clear') }}</v-btn>
          <v-btn @click="confirmDialog = false">{{ tl('Cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";
import IllustHistory from "@/repositories/IllustHistory";

export default {
  mixins: [SuperMixin],

  data() {
    return {
      enableSaveVisitHistory: true,
      notSaveNSFWWorkInHistory: false,
      confirmDialog: false
    };
  },

  beforeMount() {
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;
    this.notSaveNSFWWorkInHistory = this.browserItems.notSaveNSFWWorkInHistory;

    this.illustHistory = new IllustHistory();
  },

  watch: {
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
  },

  methods: {
    clearHistory() {
      this.illustHistory.clearData();
      this.confirmDialog = false;
    }
  }
};
</script>
