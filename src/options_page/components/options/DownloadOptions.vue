<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Downloads') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
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
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_relative_location') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ downloadRelativeLocation }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              :disabled="!enableExtTakeOverDownloads"
              @click="showDownloadRelativeLocationDialog()"
            >{{ tl('Change') }}</v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>
              Ask where to save each file before downloading
              <sup class="beta-notice">*</sup>
            </v-list-tile-title>
            <v-list-tile-sub-title>This setting has no effect if the similar setting of your Chrome is on.</v-list-tile-sub-title>
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
import SuperMixin from "@/mixins/SuperMixin";

export default {
  mixins: [
    SuperMixin
  ],

  data() {
    return {
      hasDownloadsPermission: false,

      enableExtTakeOverDownloads: false,

      downloadRelativeLocation: null,

      downloadSaveAs: false
    };
  },

  watch: {
    downloadSaveAs(val) {
      browser.storage.local.set({
        downloadSaveAs: val
      });
    }
  },

  beforeMount() {
    this.enableExtTakeOverDownloads = !!this.browserItems.enableExtTakeOverDownloads;

    this.downloadRelativeLocation = this.browserItems.downloadRelativeLocation;

    this.downloadSaveAs = !!this.browserItems.downloadSaveAs;
  },

  methods: {
    onEnableExtTakeOverDownloadsChange(val) {
      let vm = this,
          permissionsOperation = !val ? 'remove' : 'request';

      browser.permissions[permissionsOperation](
        {
          permissions: ["downloads"]
        },
        result => {
          /**
           * result will be undefined if the permissions have been granted or removed
           */
          if (typeof result !== "undefined") {
            vm.enableExtTakeOverDownloads = !val ? !result : result;

            browser.storage.local.set({
              enableExtTakeOverDownloads: vm.enableExtTakeOverDownloads
            });
          }
        }
      );
    },

    showDownloadRelativeLocationDialog() {
      this.$router.push({
        name: "DownloadRelativeLocationDialog",
        params: {
          downloadRelativeLocation: ""
        }
      });
    }
  }
};
</script>
