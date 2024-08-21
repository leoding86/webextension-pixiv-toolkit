<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Downloads') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <download-mode-option
          v-model="downloadMode"
        ></download-mode-option>

        <v-list-tile v-if="downloadMode === 2">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_max_process_download_tasks') }}</v-list-tile-title>
            <v-list-tile-sub-title style="color:brown">{{ tl('_running_too_many_download_tasks_at_same_time_may_be_cause_high_CPU_usage') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-text-field
              reverse
              v-model="maxProcessDownloadTasks"
              type="number"
              style="width:100px;"
            ></v-text-field>
          </v-list-tile-action>
        </v-list-tile>

        <!-- <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_create_a_specified_number_of_download_tasks') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_create_a_specified_number_of_download_tasks_when_downloading_illustration_or_manga') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="[1, 2, 3, 4, 5]"
              v-model="downloadTasksWhenDownloadingImages"
              type="value"
              style="width:100px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile> -->

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
            <v-list-tile-sub-title>{{ downloadRelativeLocationPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn depressed
              @click="openDownloadRelativeLocationDialog()"
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

    <v-dialog v-model.sync="showDownloadRelativeLocationDialog" max-width="560">
      <v-card>
        <v-card-text>
          <h2>{{ tl('setting_relative_location') }}</h2>
          <v-text-field
            v-model="downloadRelativeLocation"
            :error-messages="downloadRelativeFieldErrorMessages"
            @blur="onDownloadRelativeLocationFieldBlurHandler"
            placeholder="pixiv_downloads/"
            persistent-hint></v-text-field>
          <p style="font-size: 12px;" v-html="hint"></p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import GrantPermissionsBtn from "@@/components/options/GrantPermissionsBtn";
import DownloadsShelfOption from "@@/components/options/DownloadsShelfOption";
import DownloadModeOption from '@@/components/options/option-items/DownloadMode';
import browser from '@/modules/Extension/browser';

export default {
  components: {
    'grant-permissions-btn': GrantPermissionsBtn,
    'downloads-shelf-option': DownloadsShelfOption,
    'download-mode-option': DownloadModeOption
  },

  data() {
    return {
      downloadMode: 1,
      showDownloadRelativeLocationDialog: false,
      hasDownloadsPermission: false,
      downloadSaveAs: false,
      downloadTasksWhenDownloadingImages: 3,
      maxProcessDownloadTasks: 3,
      multipleDownloadsGapTime: 150,
      enableDownloadMetadata: false,
      downloadRelativeFieldErrorMessages: [],
      downloadRelativeLocation: '',
    };
  },

  computed: {
    downloadRelativeLocationPreview() {
      return this.downloadRelativeLocation === '' ?
             this.tl('_not_set') :
             this.downloadRelativeLocation;
    },

    hint () {
      let hint = this.tl('relative_location_hint');

      let replaceStr = '[RELATIVE_LOCATION]';

      if (this.downloadRelativeLocation && !this.locationRegex.test(this.downloadRelativeLocation)) {
        this.downloadRelativeFieldErrorMessages.push('Invalid input, example: "pixiv_downloads/"');
      } else {
        this.downloadRelativeFieldErrorMessages = [];

        if (!!this.downloadRelativeLocation) {
          replaceStr = this.downloadRelativeLocation;
        }
      }

      hint = hint.replace('{{downloadRelativeLocation}}', replaceStr);

      return hint;
    }
  },

  watch: {
    downloadSaveAs(val) {
      browser.storage.local.set({
        downloadSaveAs: val
      });
    },

    maxProcessDownloadTasks(val, oldVal) {
      val = parseInt(val);

      if (val < 1) {
        this.maxProcessDownloadTasks = val = 1;
      }

      browser.storage.local.set({
        maxProcessDownloadTasks: val
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
    /**
     * Non-reactive property
     */
    this.locationRegex = /^([^./]+\/)*$/i;
    this.downloadMode = this.browserItems.downloadMode || 1;
    this.downloadRelativeLocation = this.oldDownloadRelativeLocation = this.browserItems.downloadRelativeLocation;
    this.enableDownloadMetadata = !!this.browserItems.enableDownloadMetadata;
    this.downloadSaveAs = !!this.browserItems.downloadSaveAs;
    this.downloadTasksWhenDownloadingImages = this.browserItems.downloadTasksWhenDownloadingImages;
    this.maxProcessDownloadTasks = this.browserItems.maxProcessDownloadTasks;
    this.multipleDownloadsGapTime = parseInt(this.browserItems.multipleDownloadsGapTime) || 150;
  },

  methods: {
    openDownloadRelativeLocationDialog() {
      this.showDownloadRelativeLocationDialog = true;
    },

    onDownloadRelativeLocationFieldBlurHandler() {
      if (this.locationRegex.test(this.downloadRelativeLocation)) {
        browser.storage.local.set({
          downloadRelativeLocation: this.downloadRelativeLocation,
        });
        this.oldDownloadRelativeLocation = this.downloadRelativeLocation;
      } else {
        this.downloadRelativeLocation = this.oldDownloadRelativeLocation;
      }
    }
  }
};
</script>
