<template>
  <v-dialog content-class="startup-dialog" v-model="showDialog" width="50%" :persistent="true">
    <v-card>

      <v-card-text>
        <h2>Startup</h2>

        <p class="notice-text">
          <strong>{{ tl('_notice') }}</strong><br>
          {{ tl('_since_version_v4_11_0_the_extension_could_save_images_seperately_without_have_to_pack_them_into_zip_file_to_save_but_it_require_user_authorization_to_do_it_please_click_more_info_to_get_details') }}
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
    }
  },

  created() {
    this.showDialog = this.show;
    this.downloadPackFiles = this.browserItems.downloadPackFiles;
  },

  watch: {
    show (val) {
      this.showDialog = this.show;
    },

    showDialog (val) {
      this.$emit('update:show', val);
    },

    downloadPackFiles(val) {
      browser.storage.local.set({
        downloadPackFiles: !!val
      });
    }
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
