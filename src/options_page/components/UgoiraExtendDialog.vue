<template>
    <v-dialog v-model="showDialog" max-width="560">
        <v-card>
            <v-list two-line>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ lt('extend_enable') }}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-switch v-model="enableExtend"></v-switch>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ lt('extend_duration_desc') }}</v-list-tile-title>
                        <v-list-tile-sub-title>{{ lt('enable_extend_desc') }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-select :items="secondsItems"
                                  v-model="enableWhenUnderSeconds"
                                  :disabled="!enableExtend"
                                  @change="onEnableWhenUnderSecondsChangeHandler()"
                                  style="max-width: 100px"></v-select>
                    </v-list-tile-action>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ lt('extend_duration_seconds_title') }}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <v-select :items="extendDurationItems"
                                  v-model="extendDuration"
                                  :disabled="!enableExtend"
                                  @change="onExtendDurationChangeHandler()"
                                  style="max-width: 100px"></v-select>
                    </v-list-tile-action>
                </v-list-tile>
            </v-list>
        </v-card>
    </v-dialog>
</template>

<script>
import cr from '@@/modules/cr'

export default {
  name: 'UgoiraExtendDialog',
  data () {
    return {
      showDialog: true,
      secondsItems: [
          1, 2, 3
      ],
      extendDurationItems: [
          3, 4, 5
      ],
      enableExtend: false,
      enableWhenUnderSeconds: 1,
      extendDuration: 3
    }
  },
  mounted () {
      this.enableWhenUnderSeconds = window.cr.storage.items.enableWhenUnderSeconds;
      this.extendDuration = window.cr.storage.items.extendDuration;
      this.enableExtend = window.cr.storage.items.enableExtend;
  },
  watch:  {
      showDialog: function (val) {
          if (!!val === false) {
              this.$router.go(-1)
          }
      },
      enableExtend: function (val) {
          cr._s.set({
              enableExtend: val
          }).then(() => {
              window.cr.storage.items.enableExtend = val;
          });
      }
  },
  methods: {
      onEnableWhenUnderSecondsChangeHandler (evt) {
          var _this = this
          cr._s.set({
              enableWhenUnderSeconds: _this.enableWhenUnderSeconds
          }).then(() => {
              window.cr.storage.items.enableWhenUnderSeconds = _this.enableWhenUnderSeconds
          })
      },

      onExtendDurationChangeHandler (evt) {
          var _this = this
          cr._s.set({
              extendDuration: _this.extendDuration
          }).then(() => {
              window.cr.storage.items.extendDuration = _this.extendDuration
          })
      },

      lt (string) {
        return cr._e(string);
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
