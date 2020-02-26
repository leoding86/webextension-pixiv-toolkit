<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Downloads') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_grant_the_extension_to_access') }} <strong>techorus-cdn.com</strong></v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_some_user_find_some_resources_of_pixiv_are_store_at') }} <strong>techorus-cdn.com</strong></v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <grant-permissions-btn
              :item-key="accessTechorusCdnKey"
              :permissions="accessTechorusCdnPermissions"
            ></grant-permissions-btn>
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

        <v-list-tile v-if="!isFirefox">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_ext_take_over_downloads') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('setting_ext_take_over_downloads_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableExtTakeOverDownloads"
             @change="onEnableExtTakeOverDownloadsChange"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="!isFirefox">
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

        <v-list-tile v-if="!isFirefox">
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
import SuperMixin from "@/mixins/SuperMixin";
import GrantPermissionsBtn from "@@/components/options/GrantPermissionsBtn";

export default {
  mixins: [
    SuperMixin
  ],

  components: {
    'grant-permissions-btn': GrantPermissionsBtn
  },

  data() {
    return {
      askDownloadSavedWork: true,

      hasDownloadsPermission: false,

      enableExtTakeOverDownloads: false,

      downloadSaveAs: false,

      accessTechorusCdnKey: 'accessTechorusCdn',

      accessTechorusCdnPermissions: { origins: ["*://*.techorus-cdn.com/*"] }
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
    }
  },

  beforeMount() {
    this.askDownloadSavedWork = !!this.browserItems.askDownloadSavedWork;

    this.enableExtTakeOverDownloads = !!this.browserItems.enableExtTakeOverDownloads;

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
