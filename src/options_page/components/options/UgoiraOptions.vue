<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Ugoira') }}</span>
    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="showRenameUgoiraDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('rename_ugoira_file') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ ugoiraRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('quality') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="qualityItems"
              v-model="ugoiraQuanlity"
              type="value"
              @change="onUgoiraQualityChangeHandler"
              style="width:150px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('pack_ugoira_frames_info') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('pack_ugoira_frames_info_into_zip') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch
              v-model="enablePackUgoiraFramesInfo"
              @change="onEnablePackUgoiraFramesInfoChangedHandler"
            ></v-switch>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('setting_generate_and_download') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('setting_generate_and_download_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="ugoiraGenerateAndDownload"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile @click="showUgoiraExtendDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('extend_duration') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('extend_duration_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <change-location-setting
          v-model="location"
          :setting-title="tl('_save_ugoira_in_relative_location')"
          :setting-tip="browserItems.enableExtTakeOverDownloads ? '' : tl('_must_enable_extension_take_over_downloads_setting')"
          :dialog-hint="tl('_work_relative_location_desc')"
        ></change-location-setting>
      </v-list>
    </v-card>

    <router-view />
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";
import ChangeLocationSetting from '@@/components/options/ChangeLocationSetting';

export default {
  mixins: [SuperMixin],

  components: {
    'change-location-setting': ChangeLocationSetting
  },

  data() {
    return {
      qualityItems: [
        {
          text: this.tl("ugoira_normal"),
          value: 10
        },
        {
          text: this.tl("ugoira_good"),
          value: 5
        },
        {
          text: this.tl("ugoira_best"),
          value: 1
        }
      ],

      ugoiraQuanlity: 10,

      ugoiraRenameFormat: "",

      enablePackUgoiraFramesInfo: true,

      ugoiraGenerateAndDownload: false,

      location: ''
    };
  },

  beforeMount() {
    this.ugoiraQuanlity = this.browserItems.ugoiraQuanlity || 10;
    this.ugoiraRenameFormat = this.browserItems.ugoiraRenameFormat;
    this.ugoiraGenerateAndDownload = this.browserItems.ugoiraGenerateAndDownload;
    this.enablePackUgoiraFramesInfo = this.browserItems.enablePackUgoiraFramesInfo;

    this.location = this.browserItems.ugoiraRelativeLocation;
  },

  computed: {
    ugoiraRenameFormatPreview() {
      if (!!this.browserItems.ugoiraRenameFormat) {
        return this.browserItems.ugoiraRenameFormat;
      } else {
        return "Not set";
      }
    }
  },

  watch: {
    ugoiraGenerateAndDownload(val) {
      browser.storage.local.set({
        ugoiraGenerateAndDownload: val
      });
    },

    location(val) {
      browser.storage.local.set({
        ugoiraRelativeLocation: val
      })
    }
  },

  methods: {
    onUgoiraQualityChangeHandler() {
      browser.storage.local.set({
        ugoiraQuanlity: this.ugoiraQuanlity
      });
    },

    onEnablePackUgoiraFramesInfoChangedHandler: function() {
      let _this = this;
      browser.storage.local.set({
        enablePackUgoiraFramesInfo: this.enablePackUgoiraFramesInfo
      });
    },

    showRenameUgoiraDialog(evt) {
      this.$router.push({
        name: "RenameUgoira",
        params: {
          renameFormat: this.ugoiraRenameFormat
        }
      });
    },

    showUgoiraExtendDialog() {
      this.$router.push("ugoira-extend");
    }
  }
};
</script>
