<template>
  <div class="option-section">
    <span class="option-card-title">Pixiv {{ tl('Manga') }}</span>

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

      mangaPagesInChunk: 99,

      pageNumberStartWithOne: false,

      pageNumberLength: 0,

      location: '',
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

    mangaRenameFormatPreview() {
      if (!!this.browserItems.mangaRenameFormat) {
        return this.browserItems.mangaRenameFormat;
      } else {
        return "Not set";
      }
    },
  },

  watch: {
    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        mangaPageNumberStartWithOne: val
      });
    },

    pageNumberLength(val) {
      browser.storage.local.set({
        mangaPageNumberLength: val
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
    this.mangaPagesInChunk = this.browserItems.mangaPagesInChunk;
    this.pageNumberStartWithOne = this.browserItems.mangaPageNumberStartWithOne;
    this.pageNumberLength = this.browserItems.mangaPageNumberLength;

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
