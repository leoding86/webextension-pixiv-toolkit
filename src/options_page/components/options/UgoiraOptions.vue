<template>
  <div class="option-section">
    <v-list two-line>
      <v-list-tile @click="openRenameDialog">
        <v-list-tile-content>
          <v-list-tile-title>{{ tl('rename_ugoira_file') }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ renameRule }}</v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn icon ripple>
            <v-icon>keyboard_arrow_right</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>

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
            style="width:150px"
          >
          </v-select>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <rename-dialog :show.sync="showRenameDialog"
      v-model="renameRule"
      :title="tl('rename_ugoira')"
      :metas="renameMetas"
      :default-value="defaultRenameRule"
    ></rename-dialog>
  </div>
</template>

<script>
import browser from '@/modules/Extension/browser';
import RenameDialog from '@@/components/options/RenameDialog';

export default {
  components: {
    'rename-dialog': RenameDialog,
  },

  data() {
    return {
      renameRule: "",

      defaultRenameRule: "{id}_{title}",

      location: '',

      ugoiraCustomFFmpegCommand: '',

      animationJsonFormat: 1,

      showRenameDialog: false,
    };
  },

  computed: {
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
    renameRule(val) {
      if (val === '') {
        val = this.defaultRenameRule;
        this.renameRule = val;
      }

      browser.storage.local.set({
        ugoiraRenameRule: val
      });
    },

    animationJsonFormat(val) {
      browser.storage.local.set({
        animationJsonFormat: val
      });
    }
  },

  created() {
    this.renameRule = this.browserItems.ugoiraRenameRule;
    this.ugoiraCustomFFmpegCommand = this.browserItems.ugoiraCustomFFmpegCommand || '';
    this.animationJsonFormat = this.browserItems.animationJsonFormat;
    this.location = this.browserItems.ugoiraRelativeLocation;

    this.renameMetas = [
      {
        title: this.tl("id"),
        holder: "{id}"
      },
      {
        title: this.tl("title"),
        holder: "{title}"
      },
      {
        title: this.tl("author"),
        holder: "{author}"
      },
      {
        title: this.tl("author_id"),
        holder: "{authorId}"
      },
      {
        title: this.tl("year"),
        holder: "{year}"
      },
      {
        title: this.tl("month"),
        holder: "{month}"
      },
      {
        title: this.tl("day"),
        holder: "{day}"
      }
    ]
  },

  methods: {
    onUgoiraCustomFFmpegCommandChangeHandler() {
      browser.storage.local.set({
        ugoiraCustomFFmpegCommand: this.ugoiraCustomFFmpegCommand
      });
    },

    openRenameDialog() {
      this.showRenameDialog = true;
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
