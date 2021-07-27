<template>
  <v-dialog content-class="startup-dialog" v-model="showDialog" width="50%" :persistent="true">
    <v-card>

      <v-card-text>
        <h2>Startup</h2>

        <p class="notice-text">
          <strong>{{ tl('_notice') }}</strong><br>
          {{ tl('_startup_message') }}
        </p>

        <v-list two-line>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('_pack_files') }}</v-list-tile-title>
              <v-list-tile-sub-title>
                {{ tl('_pack_downloaded_files_to_a_zip_file') }}
                (<a href="https://github.com/leoding86/webextension-pixiv-toolkit/tree/master/help/about_the_pack_files_settings.md" target="_blank"><strong>{{ tl('_more_info') }}</strong></a>)
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-switch v-model="downloadPackFiles"></v-switch>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>{{ tl('_convert_tool') }}</v-list-tile-title>
              <v-list-tile-sub-title>
                {{ tl('_select_gif_convert_tool') }}
                (<a href="#" target="_blank"><strong>{{ tl('_more_info') }}</strong></a>)
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-select
                :items="convertTools"
                v-model="ugoiraConvertTool"
                type="value"
                @change="onUgoiraConvertToolChangeHandler"
                style="width:150px"
              ></v-select>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="showDialog = false">{{ tl('_close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    /**
     * @readonly
     */
    show: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showDialog: false,
      downloadPackFiles: true,
      ugoiraConvertTool: 'default',
    }
  },

  computed: {
    convertTools() {
      return [
        {
          text: this.tl("_default"),
          value: 'default'
        }, {
          text: this.tl("_ffmpeg"),
          value: 'ffmpeg'
        }
      ]
    },
  },

  created() {
    this.showDialog = this.show;
    this.downloadPackFiles = this.browserItems.downloadPackFiles;
    this.ugoiraConvertTool = this.browserItems.ugoiraConvertTool || 'default';
  },

  watch: {
    show (val) {
      this.showDialog = this.show;
    },

    showDialog (val) {
      this.$emit('update:show', val);

      if (!val) {
        browser.storage.local.set({
          importantNoticeDisplayed: true
        });
      }
    },

    downloadPackFiles(val) {
      browser.storage.local.set({
        downloadPackFiles: !!val
      });
    },

    onUgoiraConvertToolChangeHandler() {
      browser.storage.local.set({
        ugoiraConvertTool: this.ugoiraConvertTool
      });
    },
  }
}
</script>

<style lang="scss">
.startup-dialog {
  h2 {
    font-size: 22px;
  }

  .notice-text {
    font-size: 14px;
  }

  .v-list__tile {
    padding: 0;
  }
}
</style>
