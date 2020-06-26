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
            <v-list-tile-title>{{ tl('_keep_page_number') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_keep_page_number_even_if_the_illustration_only_has_one_image') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="keepPageNumber"></v-switch>
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
import SuperMixin from "@/mixins/SuperMixin";
import ChangeLocationSetting from '@@/components/options/ChangeLocationSetting';

export default {
  mixins: [
    SuperMixin
  ],

  components: {
    'change-location-setting': ChangeLocationSetting
  },

  data() {
    return {
      renameFormat: "",

      imageRenameFormat: "",

      keepPageNumber: false,

      pageNumberStartWithOne: false,

      location: ''
    };
  },

  computed: {
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
    keepPageNumber(val) {
      browser.storage.local.set({
        illustrationKeepPageNumber: val
      });
    },

    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        illustrationPageNumberStartWithOne: val
      });
    },

    location(val) {
      browser.storage.local.set({
        illustrationRelativeLocation: val
      });
    }
  },

  beforeMount() {
    this.keepPageNumber = this.browserItems.illustrationKeepPageNumber;
    this.pageNumberStartWithOne = this.browserItems.illustrationPageNumberStartWithOne;

    this.location = this.browserItems.illustrationRelativeLocation;
  },

  methods: {
    showRenameDialog(evt) {
      this.$router.push({
        name: "RenameIllustration"
      });
    },

    showRenameImageDialog(evt) {
      this.$router.push({
        name: "RenameIllustrationImage"
      });
    }
  }
};
</script>
