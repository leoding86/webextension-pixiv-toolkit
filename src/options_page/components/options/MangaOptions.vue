<template>
  <div class="option-section">
    <span class="option-card-title">{{ tl('Manga') }}</span>

    <v-card style="margin-bottom:30px;">
      <v-list two-line>
        <v-list-tile @click="showRenameMangaDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('rename_manga') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ mangaRenameFormatPreview }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon ripple>
              <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile @click="showRenameMangaImageDialog()">
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('rename_manga_image') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ mangaImageRenameFormatPreview }}</v-list-tile-sub-title>
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
            <v-switch v-model="pageNumberStartWithOne"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('number_of_pages_in_each_chunk') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('number_of_pages_in_each_chunk_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-text-field
              reverse
              v-model="mangaPagesInChunk"
              @change="mangaPagesInChunkChanged"
              type="number"
              style="width:100px;"
            ></v-text-field>
          </v-list-tile-action>
        </v-list-tile>

        <change-location-setting
          v-model="location"
          :setting-title="tl('_save_manga_in_relative_location')"
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
      mangaRenameFormat: "",

      mangaImageRenameFormat: "",

      mangaPagesInChunk: 99,

      pageNumberStartWithOne: false,

      location: ''
    };
  },

  computed: {
    mangaRenameFormatPreview() {
      if (!!this.browserItems.mangaRenameFormat) {
        return this.browserItems.mangaRenameFormat;
      } else {
        return "Not set";
      }
    },

    mangaImageRenameFormatPreview() {
      if (!!this.browserItems.mangaImageRenameFormat) {
        return this.browserItems.mangaImageRenameFormat;
      } else {
        return "Not set";
      }
    }
  },

  watch: {
    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        mangaPageNumberStartWithOne: val
      });
    },

    location(val) {
      browser.storage.local.set({
        mangaRelativeLocation: val
      })
    }
  },

  beforeMount() {
    this.mangaRenameFormat = this.browserItems.mangaRenameFormat;
    this.mangaImageRenameFormat = this.browserItems.mangaImageRenameFormat;
    this.mangaPagesInChunk = this.browserItems.mangaPagesInChunk;
    this.pageNumberStartWithOne = this.browserItems.mangaPageNumberStartWithOne;

    this.location = this.browserItems.mangaRelativeLocation;
  },

  methods: {
    showRenameMangaDialog(evt) {
      this.$router.push({
        name: "RenameManga",
        params: {
          renameFormat: this.mangaRenameFormat
        }
      });
    },

    showRenameMangaImageDialog(evt) {
      this.$router.push({
        name: "RenameMangaImage",
        params: {
          renameFormat: this.mangaImageRenameFormat
        }
      });
    },

    mangaPagesInChunkChanged() {
      let _this = this;

      if (!this.mangaPagesInChunk.match(/^[1-9]\d*$/)) {
        alert("Please input number greater then 1");
        return;
      }

      browser.storage.local.set({
        mangaPagesInChunk: parseInt(this.mangaPagesInChunk)
      });
    }
  }
};
</script>
