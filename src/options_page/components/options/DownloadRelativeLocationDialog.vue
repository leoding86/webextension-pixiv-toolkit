<template>
  <v-dialog v-model="showDialog" max-width="560">
    <v-card>
      <v-card-text>
        <h2>{{ tl('setting_relative_location') }}</h2>
        <v-text-field
          v-model="downloadRelativeLocation"
          :error-messages="errorMessages"
          placeholder="pixiv_downloads/"
          persistent-hint></v-text-field>
        <p style="font-size: 12px;" v-html="hint"></p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import cr from "@@/modules/cr";

export default {
  data () {
    return {
      showDialog: true,

      downloadRelativeLocation: '',

      errorMessages: [],

      saveTimeout: null,

      locationRegex: /^([^./]+\/)*$/i
    }
  },

  watch: {
    showDialog (val) {
      if (!!val === false) {
        this.$router.go(-1);
      }
    },

    downloadRelativeLocation (val) {
      let vm = this;

      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
      }

      if (!this.locationRegex.test(val)) {
        return;
      } else {
        this.saveTimeout = setTimeout(function () {
          cr._s.set({
            downloadRelativeLocation: vm.downloadRelativeLocation
          });
        }, 300);
      }
    }
  },

  computed: {
    hint () {
      let hint = this.tl('relative_location_hint');

      let replaceStr = '[RELATIVE_LOCATION]';

      if (this.downloadRelativeLocation && !this.locationRegex.test(this.downloadRelativeLocation)) {
        this.errorMessages.push('Invalid input, example: "pixiv_downloads/"');
      } else {
        this.errorMessages = [];

        if (!!this.downloadRelativeLocation) {
          replaceStr = this.downloadRelativeLocation;
        }
      }

      hint = hint.replace('{{downloadRelativeLocation}}', replaceStr);

      return hint;
    }
  },

  mounted () {
    let vm = this;

    cr._s.get(null).then(function(items) {
      vm.downloadRelativeLocation = items.downloadRelativeLocation;
    });
  },

  methods: {
    tl (str) {
      return cr._e(str);
    }
  }
}
</script>
