<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ tl('_convert_tool') }}</v-list-tile-title>
      <v-list-tile-sub-title>
        {{ tl('_select_gif_convert_tool') }}
          (<a href="https://github.com/leoding86/webextension-pixiv-toolkit/blob/master/docs/help.md#about-ugoira-convert-tools-en_us" target="_blank"><strong>{{ tl('_more_info') }}</strong></a>)
      </v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-select
        :items="converters"
        v-model="ugoiraConvertTool"
        type="value"
        @change="onUgoiraConvertToolChangeHandler"
        style="width:150px"
      ></v-select>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
export default {
  data() {
    return {
      ugoiraConvertTool: 'default'
    };
  },

  computed: {
    converters() {
      return [{
        text: this.tl('_default'),
        value: 'default',
      }, {
        text: this.tl('_ffmpeg'),
        value: 'ffmpeg'
      }]
    }
  },

  watch: {
    ugoiraConvertTool(val, oldVal) {
      let origin = 'https://unpkg.com/*';

      if (val === 'ffmpeg') {
        browser.permissions.contains({
          origins: [origin]
        }, result => {
          if (result) {
            browser.storage.local.set({
              ugoiraConvertTool: val
            });

            return;
          }

          if (window.confirm(this.tl('_need_permission_to_load_library_from_unpkg_com_go_to_the_next_step'))) {
            browser.permissions.request({
              origins: [origin]
            }, granted => {
              if (granted) {
                browser.storage.local.set({
                  ugoiraConvertTool: val
                });
              } else {
                this.ugoiraConvertTool = oldVal;
              }
            });
          }
        });
      } else {
        browser.storage.local.set({
          ugoiraConvertTool: this.ugoiraConvertTool,
        });
      }
    }
  },

  created() {
    this.ugoiraConvertTool = this.browserItems.ugoiraConvertTool || 'default';
  },
}
</script>
