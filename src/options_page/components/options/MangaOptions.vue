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
            <v-list-tile-title>{{ tl('setting_pack_and_download') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('setting_pack_and_download_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="mangaPackAndDownload"></v-switch>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>Page number start with 1</v-list-tile-title>
            <v-list-tile-sub-title>Page number start with 1 otherwise start with 0</v-list-tile-sub-title>
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
      </v-list>
    </v-card>
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
      mangaRenameFormat: "",

      mangaImageRenameFormat: "",

      mangaPagesInChunk: 99,

      mangaPackAndDownload: false,

      pageNumberStartWithOne: false
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
    mangaPackAndDownload(val) {
      browser.storage.local.set({
        mangaPackAndDownload: val
      });
    },

    pageNumberStartWithOne(val) {
      browser.storage.local.set({
        mangaPageNumberStartWithOne: val
      });
    }
  },

  beforeMount() {
    this.mangaRenameFormat = this.browserItems.mangaRenameFormat;
    this.mangaImageRenameFormat = this.browserItems.mangaImageRenameFormat;
    this.mangaPagesInChunk = this.browserItems.mangaPagesInChunk;
    this.mangaPackAndDownload = this.browserItems.mangaPackAndDownload;
    this.pageNumberStartWithOne = this.browserItems.mangaPageNumberStartWithOne;
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
