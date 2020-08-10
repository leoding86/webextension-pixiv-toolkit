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
            <v-list-tile-title>{{ tl('_max_history_items') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_reload_to_apply_change') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-text-field
              v-model="maxHistoryItems"
              reverse
              type="number"
              style="width:100px;"
            ></v-text-field>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_max_download_records') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_reload_to_apply_change') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-text-field
              v-model="maxDownloadRecords"
              reverse
              type="number"
              style="width:100px;"
            ></v-text-field>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Export_visit_history') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              depressed
              @click="exportVisitHistory"
            >{{ tl('_export') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Import_visit_history') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              depressed
              @click="importVisitHistory"
            >{{ tl('_import') }}<span v-if="importTotal > 0"> ({{ importedCount }} / {{ importTotal }})</span></v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_recovery_history') }} ({{ tl('_total_backup') }}: {{ historyBackupCount }})</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              depressed
              @click="recoveryHistory"
            >{{ tl('_recovery') }}<span v-if="recoveryTotal > 0"> ({{ recoveryCount }} / {{ recoveryTotal }})</span></v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('clear_history_data') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('clear_history_data_cannot_be_reversed') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              depressed
              @click="confirmDialog = true"
            >{{ tl('Clear') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>

    <v-dialog v-model="confirmDialog" width="500">
      <v-card>
        <v-card-title>{{ tl('clear_history_data') }}</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">{{ tl('_this_operation_cannot_be_reversed_are_you_sure') }}</p>
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
import IllustHistory from "@/repositories/IllustHistory";
import HistoryBackup from "@/repositories/HistoryBackup";
import importIllustHistoryWorker from "worker-loader?inline=true,fallback=false!@/options_page/workers/importIllustHistoryWorker.js";

export default {
  data() {
    return {
      enableSaveVisitHistory: true,
      notSaveNSFWWorkInHistory: false,
      confirmDialog: false,
      importing: false,
      exporting: false,
      importTotal: 0,
      importedCount: 0,
      recoveryTotal: 0,
      recoveryCount: 0,
      maxHistoryItems: 10000,
      maxDownloadRecords: 10000
    };
  },

  beforeMount() {
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;
    this.notSaveNSFWWorkInHistory = this.browserItems.notSaveNSFWWorkInHistory;
    this.maxHistoryItems = this.browserItems.maxHistoryItems;
    this.maxDownloadRecords = this.browserItems.maxDownloadRecords;

    this.illustHistory = new IllustHistory();
    this.historyBackup = new HistoryBackup();
  },

  computed: {
    historyBackupCount() {
      return this.browserItems.historyBackup ? this.browserItems.historyBackup.length : 0;
    }
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
    },

    maxHistoryItems(val) {
      if (/^\d+$/.test(val) && val > 0) {
        browser.storage.local.set({
          maxHistoryItems: val
        });
      } else {
        this.maxHistoryItems = 10000;
      }
    },

    maxDownloadRecords(val) {
      if (/^\d+$/.test(val) && val > 0) {
        browser.storage.local.set({
          maxDownloadRecords: val
        });
      } else {
        this.maxDownloadRecords = 10000;
      }
    }
  },

  methods: {
    clearHistory() {
      this.illustHistory.clearData();
      this.historyBackup.forgetAll();
      this.confirmDialog = false;
    },

    exportVisitHistory() {
      if (this.exporting || this.importing) {
        return
      }

      this.exporting = true

      let json = ''
      let vm = this

      this.illustHistory.getIllusts({
        limit: null
      }).then(docs => {
        let blob = new Blob([JSON.stringify(docs)], {type: 'application/json'})

        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'illust_histories-' + Date.now() + '.json'
        document.body.appendChild(a);
        a.click()
        a.remove();
        vm.exporting = false
      })
    },

    importVisitHistory() {
      if (this.exporting || this.importing) {
        return
      }

      let input = document.createElement('input')
      let vm = this

      input.type = 'file'
      input.addEventListener('change', (e) => {
        const files = e.target.files

        let fileReader = new FileReader()

        vm.importing = true

        fileReader.addEventListener('load', () => {
          let items

          try {
            items = JSON.parse(fileReader.result)

            vm.importTotal = items.length

            let worker = new importIllustHistoryWorker();

            worker.onmessage = e => {
              vm.importedCount = e.data.importedCount

              if (e.data.imported) {
                vm.importedCount = items.length

                vm.importTotal = 0 // disable displaying import progress


                setImmediate(() => {
                  vm.importing = false
                  alert('Import complete.')
                });
              }
            }

            worker.postMessage({
              items: items
            })

            // vm.importTotal = items.length

            // vm.importIllustItems(items).then(() => {
            //   alert('Import complete')
            //   window.location.reload()
            // })
          } catch (e) {
            console.log(e)
          }
        })

        fileReader.readAsText(files[0])
      })

      if (window.confirm(this.tl('_import_history_will_take_some_time_determine_by_how_many_history_need_to_be_imported_are_you_sure'))) {
        input.click()
      }
    },

    recoveryHistory() {
      if (!window.confirm(this.tl('_recovery_history_will_take_some_time_determine_by_how_many_history_need_to_be_recovery_are_you_sure'))) {
        return;
      }

      let items = this.browserItems.historyBackup;

      this.recoveryTotal = items.length

      let worker = new importIllustHistoryWorker();

      worker.onmessage = e => {
        this.recoveryCount = e.data.importedCount

        if (e.data.imported) {
          this.recoveryCount = items.length

          this.recoveryTotal = 0 // disable displaying import progress

          setImmediate(() => {
            this.importing = false
            alert(this.tl('_recovery_complete_refresh_page_please'))
          });
        }
      }

      worker.postMessage({
        items: items
      });
    }
  }
};
</script>
