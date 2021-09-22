<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Illustration') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="showRenameDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Rename_illustration') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ renameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile @click="showRenameImageDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('Rename_illustration_image') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ imageRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_create_subdirectory') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_create_subdirectory_when_download_Pack_Files_setting_is_disabled') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select :items="createSubdirectoryOptions" v-model="createSubdirectory"
              style="width:220px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_always_pack') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_always_pack_images_into_zip_file_even_if_there_is_only_one_image_in_the_illustration') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="alwaysPack"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_page_number_start_with_1') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_page_number_start_with_1_otherwise_start_with_0') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="pageNumberStartWithOne"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_the_length_of_page_number') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_zeros_will_be_filled_at_the_beginning_of_page_number') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select :items="pageNumberLengthOptions"
              v-model="pageNumberLength"
              style="width:150px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>

        <change-location-setting
          v-model="location"
          :setting-title="tl('_save_illustration_in_relative_location')"
          :setting-tip="browserItems.enableExtTakeOverDownloads ? '' : tl('_must_enable_extension_take_over_downloads_setting')"
          :dialog-hint="tl('_work_relative_location_desc')"
        ></change-location-setting>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import ChangeLocationSetting from '@@/components/options/ChangeLocationSetting';

export default {
  components: {
    'change-location-setting': ChangeLocationSetting
  },

  data() {
    return {
      renameFormat: "",

      imageRenameFormat: "",

      alwaysPack: false,

      pageNumberStartWithOne: false,

      pageNumberLength: 0,

      location: '',

      createSubdirectory: 1,
    };
  },

  computed: {
    createSubdirectoryOptions() {
      return [{
        text: this.tl('_disable'),
        value: 0,
      }, {
        text: this.tl('_enable'),
        value: 1,
      }, {
        text: this.tl('_when_multiple_images'),
        value: 2,
      }]
    },

    pageNumberLengthOptions() {
      return [{
        text: this.tl('_disable'),
        value: 0,
      }, {
        text: this.tl('_dynamic'),
        value: -1,
      }, {
        text: '2',
        value: 2
      }, {
        text: '3',
        value: 3
      }, {
        text: '4',
        value: 4
      }];
    },

    renameFormatPreview() {
      if (!!this.browserItems.illustrationRenameFormat) {
        return this.browserItems.illustrationRenameFormat;
      } else {
        return "Not set";
      }
    },

    imageRenameFormatPreview() {
      if (!!this.browserItems.illustrationImageRenameFormat) {
        return this.browserItems.illustrationImageRenameFormat;
      } else {
        return "Not set";
      }
    }
  },

  watch: {

    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        illustrationPageNumberStartWithOne: val
      });
    },

    pageNumberLength(val) {
      browser.storage.local.set({
        illustrationPageNumberLength: val
      });
    },

    location(val) {
      browser.storage.local.set({
        illustrationRelativeLocation: val
      });
    },

    alwaysPack(val) {
      browser.storage.local.set({
        alwaysPack: !!val
      });
    },

    createSubdirectory(val) {
      browser.storage.local.set({
        illustrationCreateSubdirectory: val
      });
    }
  },

  beforeMount() {
    this.pageNumberStartWithOne = this.browserItems.illustrationPageNumberStartWithOne;
    this.pageNumberLength = this.browserItems.illustrationPageNumberLength;

    this.location = this.browserItems.illustrationRelativeLocation;
    this.alwaysPack = this.browserItems.alwaysPack;
    this.createSubdirectory = this.browserItems.illustrationCreateSubdirectory;
  },

  methods: {
    showRenameDialog(evt) {
      this.routeTo('RenameIllustration');
    },

    showRenameImageDialog(evt) {
      this.routeTo('RenameIllustrationImage');
    }
  }
};
</script>
