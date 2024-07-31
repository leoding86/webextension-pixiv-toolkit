<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('_interface') }}</span>

    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_language') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="languageOptions"
              v-model="language"
              type="value"
              @change="onLanguageChangeHandler"
              style="width:150px"
            >
            </v-select>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

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

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_download_panel_position') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select :items="downloadPanelPositionOptions"
              v-model="downloadPanelPosition"
              type="value"
              @change="onDownloadPanelPositionChangeHandler"
              style="width:150px"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_download_panel_style') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select :items="downloadPanelStyleOptions"
              v-model="downloadPanelStyle"
              type="value"
              @change="onDownloadPanelStyleChangeHandler"
              style="width:150px"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_show') }} Pixiv Omina</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="showPixivOmina"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>

      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_show_reload_in_popup') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="showReloadInPopup"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import defaultSettings from '@/config/default';
import browser from '@/modules/Extension/browser';

export default {
  data() {
    return {
      autoActivateDownloadPanel: false,

      language: 'en',

      downloadPanelStyle: 1,

      downloadPanelPosition: 'center',

      showReloadInPopup: false,

      showPixivOmina: true,
    };
  },

  computed: {
    languageOptions() {
      return [
        {
          text: this.tl('_default'),
          value: 'default'
        }, {
          text: '简体中文',
          value: 'zh_CN',
        }, {
          text: 'English',
          value: 'en'
        }
      ];
    },

    downloadPanelPositionOptions() {
      return [
        {
          text: this.tl('_center'),
          value: 'center'
        }, {
          text: this.tl('_left'),
          value: 'left'
        }, {
          text: this.tl('_right'),
          value: 'right'
        }
      ]
    },

    downloadPanelStyleOptions() {
      return [
        {
          text: this.tl('_type') + ' 1',
          value: 1
        }, {
          text: this.tl('_type') + ' 2',
          value: 2
        }
      ]
    }
  },

  beforeMount() {
    this.autoActivateDownloadPanel = this.browserItems.autoActivateDownloadPanel;
    this.language = this.browserItems.language || 'default';
    this.downloadPanelPosition = this.browserItems.downloadPanelPosition;
    this.downloadPanelStyle = this.browserItems.downloadPanelStyle;
    this.showReloadInPopup = this.browserItems.showReloadInPopup;
    this.showPixivOmina = this.browserItems.showPixivOmina;
  },

  watch: {
    autoActivateDownloadPanel(val) {
      browser.storage.local.set({
        autoActivateDownloadPanel: !!val
      });
    },

    showReloadInPopup(val) {
      browser.storage.local.set({
        showReloadInPopup: val
      });
    },

    showPixivOmina(val) {
      browser.storage.local.set({
        showPixivOmina: val
      });
    }
  },

  methods: {
    onLanguageChangeHandler(val) {
      browser.storage.local.set({
        language: val
      });
    },

    onDownloadPanelPositionChangeHandler(val) {
      browser.storage.local.set({
        downloadPanelPosition: val
      });
    },

    onDownloadPanelStyleChangeHandler(val) {
      browser.storage.local.set({
        downloadPanelStyle: parseInt(val)
      });
    },

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
    }
  }
};
</script>
