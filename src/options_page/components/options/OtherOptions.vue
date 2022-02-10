<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Others') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_export_settings') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-menu
              open-on-hover
              top
              offset-x
              left
            >
              <template
                v-slot:activator="{ on }"
              >
                <v-btn
                  depressed
                  v-on="on"
                >{{ tl('_export') }}</v-btn>
              </template>
              <v-list>
                <v-list-tile
                  @click="exportSettings"
                >{{ tl('_all_settings') }}</v-list-tile>
                <v-list-tile
                  @click="exportSettings({ excludeHistoryBackup: true })"
                >{{ tl('_exclude_history_backup') }}</v-list-tile>
              </v-list>
            </v-menu>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile two-line>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_import_settings') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-menu
              open-on-hover
              top
              offset-x
              left
            >
              <template
                v-slot:activator="{ on }"
              >
                <v-btn
                  depressed
                  v-on="on"
                >{{ tl('_import') }}</v-btn>
              </template>
              <v-list>
                <v-list-tile
                  @click="importSettings({})"
                >{{ tl('_all_settings') }}</v-list-tile>
                <v-list-tile
                  @click="importSettings({ excludeHistoryBackup: true })"
                >{{ tl('_exclude_history_backup') }}</v-list-tile>
              </v-list>
            </v-menu>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Reload_extension') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('Reload_extension_if_there_is_something_wrong') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn depressed @click="reload">{{ tl('Reload') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_diagnosis_messages') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn depressed @click="viewDiagnosis">{{ tl('_view') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import defaultSettings from '@/config/default';

export default {
  methods: {
    exportSettings({ excludeHistoryBackup = false }) {
      let settings = Object.assign({}, this.browserItems);

      if (excludeHistoryBackup) {
        delete settings.historyBackup;
      }

      let blob = new Blob([JSON.stringify(settings)], {type: 'application/json'})

      let a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'pixiv_toolkit_settings-' + Date.now() + '.json'
      document.body.appendChild(a);
      a.click();
      a.remove();
    },

    importSettings({ excludeHistoryBackup = false }) {
      let input = document.createElement('input');

      input.type = 'file'
      input.addEventListener('change', (e) => {
        const files = e.target.files

        let fileReader = new FileReader()

        fileReader.addEventListener('load', () => {
          try {
            let importSettings = JSON.parse(fileReader.result);

            if (importSettings) {
              let setting;

              Object.keys(defaultSettings).forEach(key => {
                if (excludeHistoryBackup && key === 'historyBackup') {
                  return;
                }

                if (importSettings[key] &&
                  (typeof defaultSettings[key] === typeof importSettings[key] || typeof importSettings[key] === 'string') // checking logic need be improved
                ) {
                  defaultSettings[key] = importSettings[key];
                }
              });

              browser.storage.local.set(defaultSettings);

              alert('Settings imported');

              window.location.reload();
            }
          } catch (e) {
            console.log(e)
          }
        });

        fileReader.readAsText(files[0])
      });

      input.click();
    },


    reload() {
      browser.runtime.reload();
    },

    viewDiagnosis() {
      this.$router.push({ name: 'DiagnosisMessages'});
    }
  }
};
</script>
