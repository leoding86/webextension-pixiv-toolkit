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

        <ugoira-converter-option></ugoira-converter-option>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_ffmpeg_custom_convert_command') }} (<a href="https://github.com/leoding86/webextension-pixiv-toolkit/blob/master/docs/help.md#about-ffmpeg-custom-convert-command-en_us" target="_blank"><strong>{{ tl('_more_info') }}</strong></a>)</v-list-tile-title>
            <v-list-tile-sub-title>
              <input class="option-section__input-text" v-model="ugoiraCustomFFmpegCommand"
                :placeholder="tl('_not_set')" @blur="onUgoiraCustomFFmpegCommandChangeHandler"
              >
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('quality') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_has_not_effect_if_selected_converter_is_ffmpeg') }}</v-list-tile-sub-title>
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
            <v-list-tile-title>
              {{ tl('pack_ugoira_frames_info') }}
              <v-tooltip
                bottom
              >
                <template
                  v-slot:activator="{ on }"
                >
                  <v-icon
                    v-on="on"
                    small
                  >info</v-icon>
                </template>
                <span>{{ tl('pack_ugoira_frames_info_into_tip') }}</span>
              </v-tooltip>
            </v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('pack_ugoira_frames_info_into_zip') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="animationJsonFormatOptions"
              v-model="animationJsonFormat"
              type="value"
              @change="onAnimationJsonChangeHandler"
              style="width:150px"
            >
            </v-select>
            <!-- <v-switch
              v-model="enablePackUgoiraFramesInfo"
              @change="onEnablePackUgoiraFramesInfoChangedHandler"
            ></v-switch> -->
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
import ChangeLocationSetting from '@@/components/options/ChangeLocationSetting';
import UgoiraConverterOption from '@@/components/options/UgoiraConverterOption';

export default {
  components: {
    'change-location-setting': ChangeLocationSetting,
    'ugoira-converter-option': UgoiraConverterOption,
  },

  data() {
    return {
      ugoiraQuanlity: 10,

      ugoiraRenameFormat: "",

      enablePackUgoiraFramesInfo: true,

      location: '',

      ugoiraCustomFFmpegCommand: '',
    };
  },

  beforeMount() {
    this.ugoiraQuanlity = this.browserItems.ugoiraQuanlity || 10;
    this.ugoiraRenameFormat = this.browserItems.ugoiraRenameFormat;
    this.ugoiraCustomFFmpegCommand = this.browserItems.ugoiraCustomFFmpegCommand || '';
    this.enablePackUgoiraFramesInfo = this.browserItems.enablePackUgoiraFramesInfo;
    this.animationJsonFormat = this.browserItems.animationJsonFormat;

    this.location = this.browserItems.ugoiraRelativeLocation;
  },

  computed: {
    ugoiraRenameFormatPreview() {
      if (!!this.browserItems.ugoiraRenameFormat) {
        return this.browserItems.ugoiraRenameFormat;
      } else {
        return "Not set";
      }
    },

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

    qualityItems() {
      return [
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
      ];
    },

    animationJsonFormatOptions() {
      return [
        {
          text: this.tl('_do_not_pack'),
          value: 0
        }, {
          text: this.tl('_type') + ' 1',
          value: 1,
        }, {
          text: this.tl('_type') + ' 2',
          value: 2
        }
      ];
    }
  },

  watch: {
    location(val) {
      browser.storage.local.set({
        ugoiraRelativeLocation: val
      })
    }
  },

  methods: {
    onUgoiraCustomFFmpegCommandChangeHandler() {
      browser.storage.local.set({
        ugoiraCustomFFmpegCommand: this.ugoiraCustomFFmpegCommand
      });
    },

    onUgoiraQualityChangeHandler() {
      browser.storage.local.set({
        ugoiraQuanlity: this.ugoiraQuanlity
      });
    },

    onAnimationJsonChangeHandler() {
      browser.storage.local.set({
        animationJsonFormat: this.animationJsonFormat
      });
    },

    onEnablePackUgoiraFramesInfoChangedHandler: function() {
      let _this = this;
      browser.storage.local.set({
        enablePackUgoiraFramesInfo: this.enablePackUgoiraFramesInfo
      });
    },

    showRenameUgoiraDialog(evt) {
      this.pushRoute({
        name: 'RenameUgoira',
        params: {
          renameFormat: this.ugoiraRenameFormat
        }
      });
    },

    showUgoiraExtendDialog() {
      this.routeTo('UgoiraExtend');
    }
  }
};
</script>

<style lang="scss">
.option-section__input-text {
  width: 100%;
  padding: 5px 0;
  background: #efefef;
  border-radius: 5px;
  text-indent: 1em;
}
</style>
