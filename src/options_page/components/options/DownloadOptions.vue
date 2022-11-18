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
            <v-list-tile-title>{{ tl('_download_metadata') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_download_metadata_when_downloading_works_only_support_works_from_pixiv_main_site') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableDownloadMetadata"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <downloads-shelf-option v-if="$_browser !== 'firefox'"></downloads-shelf-option>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_relative_location') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ downloadRelativeLocation }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn depressed
              @click="showDownloadRelativeLocationDialog()"
            >{{ tl('Change') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ tl('_multiple_downloads_time_gap') }} {{ tl('_unit_ms') }}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              {{ tl('_add_time_gap_between_each_file_download_to_prevent_download_issue') }}
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-text-field
              reverse
              v-model="multipleDownloadsGapTime"
              type="number"
              style="width:100px;"
            ></v-text-field>
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
      hasDownloadsPermission: false,

      downloadSaveAs: false,

      downloadTasksWhenDownloadingImages: 3,

      multipleDownloadsGapTime: 150,

      enableDownloadMetadata: false,
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

    downloadTasksWhenDownloadingImages(val, oldVal) {
      val = parseInt(val);

      if (val < 2 || val > 5) {
        this.downloadTasksWhenDownloadingImages = (oldVal < 2 || oldVal > 5) ? 3 : oldVal;
      }

      browser.storage.local.set({
        downloadTasksWhenDownloadingImages: val
      });
    },

    multipleDownloadsGapTime(val) {
      browser.storage.local.set({
        multipleDownloadsGapTime: parseInt(val)
      });
    },

    enableDownloadMetadata(val) {
      browser.storage.local.set({
        enableDownloadMetadata: !!val
      });
    }
  },

  created() {
    this.enableDownloadMetadata = !!this.browserItems.enableDownloadMetadata;
  },

  beforeMount() {
    this.downloadSaveAs = !!this.browserItems.downloadSaveAs;

    this.downloadTasksWhenDownloadingImages = this.browserItems.downloadTasksWhenDownloadingImages;

    this.multipleDownloadsGapTime = parseInt(this.browserItems.multipleDownloadsGapTime) || 150;
  },

  methods: {
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
