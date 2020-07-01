<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Others') }}</span>

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
            <v-list-tile-title>{{ tl('Reload_extension') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('Reload_extension_if_there_is_something_wrong') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn depressed @click="reload">{{ tl('Reload') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      autoActivateDownloadPanel: false,

      language: 'en',

      languageOptions: [
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
      ]
    };
  },

  beforeMount() {
    this.autoActivateDownloadPanel = this.browserItems.autoActivateDownloadPanel;
    this.language = this.browserItems.language || 'default';
  },

  watch: {
    autoActivateDownloadPanel(val) {
      browser.storage.local.set({
        autoActivateDownloadPanel: !!val
      });
    }
  },

  methods: {
    onLanguageChangeHandler(val) {
      browser.storage.local.set({
        language: val
      });
    },

    reload() {
      browser.runtime.reload();
    }
  }
};
</script>
