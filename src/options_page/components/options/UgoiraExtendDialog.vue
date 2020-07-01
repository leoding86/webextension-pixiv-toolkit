<template>
  <v-dialog v-model="showDialog" max-width="560">
    <v-card>
      <v-list two-line>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('extend_enable') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-switch v-model="enableExtend"></v-switch>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('extend_duration_desc') }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ tl('enable_extend_desc') }}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="secondsItems"
              v-model="enableWhenUnderSeconds"
              :disabled="!enableExtend"
              @change="onEnableWhenUnderSecondsChangeHandler()"
              style="max-width: 110px"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>{{ tl('extend_duration_seconds_title') }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-select
              :items="extendDurationItems"
              v-model="extendDuration"
              :disabled="!enableExtend"
              @change="onExtendDurationChangeHandler()"
              style="max-width: 110px"
            ></v-select>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UgoiraExtendDialog",

  data() {
    return {
      showDialog: true,
      secondsItems: [
        { value: 1, text: '1 second' },
        { value: 2, text: '2 seconds' },
        { value: 3, text: '3 seconds' }
      ],
      extendDurationItems: [
        { value: 3, text: '3 seconds' },
        { value: 4, text: '4 seconds' },
        { value: 5, text: '5 seconds' }
      ],
      enableExtend: false,
      enableWhenUnderSeconds: 1,
      extendDuration: 3
    };
  },

  beforeMount() {
    this.enableWhenUnderSeconds = this.browserItems.enableWhenUnderSeconds;
    this.extendDuration = this.browserItems.extendDuration;
    this.enableExtend = this.browserItems.enableExtend;
  },

  watch: {
    showDialog: function(val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },
    enableExtend: function(val) {
      browser.storage.local.set({
        enableExtend: val
      });
    }
  },
  methods: {
    onEnableWhenUnderSecondsChangeHandler(evt) {
      var _this = this;
      browser.storage.local.set({
        enableWhenUnderSeconds: _this.enableWhenUnderSeconds
      });
    },

    onExtendDurationChangeHandler(evt) {
      var _this = this;
      browser.storage.local.set({
        extendDuration: _this.extendDuration
      });
    }
  }
};
</script>
