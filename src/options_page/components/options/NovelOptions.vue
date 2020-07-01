<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Novel') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="openRenameDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('rename_novel') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ novelRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('include_novel_description') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('include_novel_description_at_the_beginning') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="novelIncludeDescription"></v-switch>
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

    <router-view></router-view>
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
      novelIncludeDescription: false,

      location: ''
    }
  },

  computed: {
    novelRenameFormatPreview() {
      return this.browserItems.novelRenameFormat || 'Not set';
    }
  },

  beforeMount() {
    this.novelIncludeDescription = this.browserItems.novelIncludeDescription;

    this.location = this.browserItems.novelRelativeLocation;
  },

  watch: {
    novelIncludeDescription(val) {
      /**
       * Prevent updating setting after component is created every time
       */
      if (this.browserItems.novelIncludeDescription !== val) {
        browser.storage.local.set({
          novelIncludeDescription: !!val
        });
      }
    },

    location(val) {
      browser.storage.local.set({
        novelRelativeLocation: val
      });
    }
  },

  methods: {
    openRenameDialog() {
      this.routeTo('RenameNovel');
    }
  }
}
</script>
