<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Downloads') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_create_a_specified_number_of_download_tasks') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_create_a_specified_number_of_download_tasks_when_downloading_illustration_or_manga') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="[2, 3, 4, 5]"
              v-model="downloadTasksWhenDownloadingImages"
              type="value"
              style="width:100px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_pack_files') }}</v-list-tile-title>
            <v-list-tile-sub-title>
              {{ tl('_pack_downloaded_files_to_a_zip_file') }}
              (<a href="https://github.com/leoding86/webextension-pixiv-toolkit/tree/master/docs/help.md#about-the-pack-files-setting-en_us" target="_blank"><strong>{{ tl('_more_info') }}</strong></a>)
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="downloadPackFiles"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_ask_whether_to_download_the_work_may_has_been_downloaded') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="askDownloadSavedWork"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_ext_take_over_downloads') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('setting_ext_take_over_downloads_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableExtTakeOverDownloads"
             @change="onEnableExtTakeOverDownloadsChange"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <downloads-shelf-option></downloads-shelf-option>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_relative_location') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ downloadRelativeLocation }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              depressed
              :disabled="!enableExtTakeOverDownloads"
              @click="showDownloadRelativeLocationDialog()"
            >{{ tl('Change') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ tl('Ask_where_to_save_each_file_before_downloading') }}
              <sup class="beta-notice">*</sup>
            </v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('This_setting_has_no_effect_if_the_similar_setting_of_your_Chrome_is_on') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch
              v-model="downloadSaveAs"
              :disabled="!enableExtTakeOverDownloads"
            ></v-switch>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>

    <router-view />
  </div>
</template>

<script>
import GrantPermissionsBtn from "@@/components/options/GrantPermissionsBtn";
import DownloadsShelfOption from "@@/components/options/DownloadsShelfOption";
import browser from '@/modules/Extension/browser';

export default {
  components: {
    'grant-permissions-btn': GrantPermissionsBtn,
    'downloads-shelf-option': DownloadsShelfOption
  },

  data() {
    return {
      askDownloadSavedWork: true,

      hasDownloadsPermission: false,

      enableExtTakeOverDownloads: false,

      downloadSaveAs: false,

      downloadTasksWhenDownloadingImages: 3,

      downloadPackFiles: true,
    };
  },

  computed: {
    downloadRelativeLocation() {
      return this.browserItems.downloadRelativeLocation;
    }
  },

  watch: {
    downloadSaveAs(val) {
      browser.storage.local.set({
        downloadSaveAs: val
      });
    },

    askDownloadSavedWork(val) {
      browser.storage.local.set({
        askDownloadSavedWork: val
      });
    },

    downloadTasksWhenDownloadingImages(val, oldVal) {
      val = parseInt(val);

      if (val < 2 || val > 5) {
        this.downloadTasksWhenDownloadingImages = (oldVal < 2 || oldVal > 5) ? 3 : oldVal;
      }

      browser.storage.local.set({
        downloadTasksWhenDownloadingImages: val
      });
    },

    downloadPackFiles(val) {
      browser.storage.local.set({
        downloadPackFiles: !!val
      });
    }
  },

  created() {
    this.enableExtTakeOverDownloads = !!this.browserItems.enableExtTakeOverDownloads;

    if (this.enableExtTakeOverDownloads) {
      browser.permissions.contains({
        permissions: ['downloads', 'downloads.shelf'],
      }, result => {
        if (!result) {
          this.enableExtTakeOverDownloads = false;

          browser.storage.local.set({
            enableExtTakeOverDownloads: this.enableExtTakeOverDownloads,
          });
        }
      });
    }
  },

  beforeMount() {
    this.askDownloadSavedWork = !!this.browserItems.askDownloadSavedWork;

    this.downloadSaveAs = !!this.browserItems.downloadSaveAs;

    this.downloadTasksWhenDownloadingImages = this.browserItems.downloadTasksWhenDownloadingImages;

    this.downloadPackFiles = !!this.browserItems.downloadPackFiles;
  },

  methods: {
    onEnableExtTakeOverDownloadsChange(val) {
      if (val) {
        browser.permissions.request({
          permissions: ['downloads', 'downloads.shelf'],
        }, result => {
          this.enableExtTakeOverDownloads = !!result;

          browser.storage.local.set({
            enableExtTakeOverDownloads: this.enableExtTakeOverDownloads,
          });
        });
      } else {
        this.enableExtTakeOverDownloads = false;

        browser.storage.local.set({
          enableExtTakeOverDownloads: this.enableExtTakeOverDownloads,
        });
      }
    },

    showDownloadRelativeLocationDialog() {
      this.pushRoute({
        name: "DownloadRelativeLocationDialog",
        params: {
          downloadRelativeLocation: ""
        }
      });
    }
  }
};
</script>
