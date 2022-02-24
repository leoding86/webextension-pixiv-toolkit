<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('_pixiv_comic') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="showRenameDialog = true">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_rename_comic') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ pixivComicRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile @click="showRenameImageDialog = true">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_rename_comic_image') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ pixivComicImageRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_page_number_start_with_1') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_page_number_start_with_1_otherwise_start_with_0') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="pixivComicPageNumberStartWithOne"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('_the_length_of_page_number') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('_zeros_will_be_filled_at_the_beginning_of_page_number') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select :items="pageNumberLengthOptions"
              v-model="pixivComicPageNumberLength"
              style="width:150px;"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>

        <change-location-setting
          v-model="location"
          :setting-title="tl('_save_comic_in_relative_location')"
          :setting-tip="browserItems.enableExtTakeOverDownloads ? '' : tl('_must_enable_extension_take_over_downloads_setting')"
          :dialog-hint="tl('_work_relative_location_desc')"
        ></change-location-setting>
      </v-list>
    </v-card>

    <rename-dialog :show.sync="showRenameDialog"
      v-model="pixivComicRenameFormat"
      :title="tl('_rename_comic')"
      :metas="renameMetas"
    ></rename-dialog>

    <rename-dialog :show.sync="showRenameImageDialog"
      v-model="pixivComicImageRenameFormat"
      :title="tl('_rename_comic_image')"
      :metas="renameImageMetas"
    ></rename-dialog>
  </div>
</template>

<script>
import ChangeLocationSetting from '@@/components/options/ChangeLocationSetting';
import RenameDialog from '@@/components/options/RenameDialog';
import browser from '@/modules/Extension/browser';

export default {
  components: {
    'change-location-setting': ChangeLocationSetting,
    'rename-dialog': RenameDialog,
  },

  data() {
    return {
      pixivComicRenameFormat: "",

      pixivComicImageRenameFormat: "",

      pixivComicPageNumberStartWithOne: false,

      pixivComicPageNumberLength: 0,

      location: '',

      showRenameDialog: false,

      showRenameImageDialog: false,
    };
  },

  computed: {
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

    pixivComicRenameFormatPreview() {
      if (!!this.browserItems.pixivComicRenameFormat) {
        return this.browserItems.pixivComicRenameFormat;
      } else {
        return "Not set";
      }
    },

    pixivComicImageRenameFormatPreview() {
      if (!!this.browserItems.pixivComicImageRenameFormat) {
        return this.browserItems.pixivComicImageRenameFormat;
      } else {
        return "Not set";
      }
    }
  },

  watch: {
    pixivComicRenameFormat(val) {
      browser.storage.local.set({
        pixivComicRenameFormat: val
      });
    },

    pixivComicImageRenameFormat(val) {
      browser.storage.local.set({
        pixivComicImageRenameFormat: val
      });
    },

    pixivComicPageNumberStartWithOne(val) {
      browser.storage.local.set({
        pixivComicPageNumberStartWithOne: val
      });
    },

    pixivComicPageNumberLength(val) {
      browser.storage.local.set({
        pixivComicPageNumberLength: val
      });
    },

    location(val) {
      browser.storage.local.set({
        pixivComicRelativeLocation: val
      })
    }
  },

  created() {
    this.renameMetas = [{
      holder: '{id}',
      title: this.tl('_id'),
    }, {
      holder: '{title}',
      title: this.tl('_title'),
    }, {
      holder: '{subTitle}',
      title: this.tl('_sub_title'),
    }, {
      holder: '{numberingTitle}',
      title: this.tl('_numbering_title'),
    }, {
      holder: '{workId}',
      title: this.tl('_work_id'),
    }, {
      holder: '{workTitle}',
      title: this.tl('_work_title'),
    }];

    this.renameImageMetas = [].concat(this.renameMetas).concat([{
      holder: '{pageNum}',
      title: this.tl('_page_num'),
    }]);

    this.pixivComicRenameFormat = this.browserItems.pixivComicRenameFormat;
    this.pixivComicImageRenameFormat = this.browserItems.pixivComicImageRenameFormat;
    this.pixivComicPageNumberStartWithOne = this.browserItems.pixivComicPageNumberStartWithOne;
    this.pixivComicPageNumberLength = this.browserItems.pixivComicPageNumberLength;
    this.location = this.browserItems.pixivComicRelativeLocation;
  }
};
</script>
