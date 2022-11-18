<template>
  <v-dialog content-class="startup-dialog" v-model="showDialog" width="50%" :persistent="true">
    <v-card>

      <v-card-text>
        <h2>Startup</h2>

        <p class="notice-text">
          <strong>{{ tl('_notice') }}</strong><br>
          {{ tl('_startup_message') }}
        </p>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click="showDialog = false">{{ tl('_close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DownloadsShelfOption from '@@/components/options/DownloadsShelfOption';

export default {
  components: {
    'downloads-shelf-option': DownloadsShelfOption,
  },

  props: {
    /**
     * @readonly
     */
    show: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showDialog: false,
    }
  },

  computed: {
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
  },

  created() {
    this.showDialog = this.show;
  },

  watch: {
    show (val) {
      this.showDialog = this.show;
    },

    showDialog (val) {
      this.$emit('update:show', val);

      if (!val) {
        browser.storage.local.set({
          importantNoticeDisplayed: true
        });
      }
    },
  }
}
</script>

<style lang="scss">
.startup-dialog {
  h2 {
    font-size: 22px;
  }

  .notice-text {
    font-size: 14px;
  }

  .v-list__tile {
    padding: 0;
  }
}
</style>
