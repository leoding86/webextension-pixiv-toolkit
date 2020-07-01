<template>
  <div class="change-folder-btn">
    <v-btn
      depressed
      :disabled="disabled"
      @click="showDialog = true"
    >{{ tl('_change') }}</v-btn>
    <v-dialog v-model="showDialog" max-width="560">
      <v-card>
        <v-card-text>
          <h2>{{ dialogTitle }}</h2>
          <v-text-field
            v-model="inputLocation"
            :error-messages="errorMessages"
            :placeholder="placeholder"
            persistent-hint></v-text-field>
          <p style="font-size: 12px;" v-html="hint"></p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      required: false,
      type: Boolean,
      default: true
    },

    dialogTitle: {
      required: false,
      type: String,
      default: 'Input relative location'
    },

    placeholder: {
      required: false,
      type: String,
      default: 'pixiv_downloads/'
    },

    dialogHint: {
      required: false,
      type: String,
      default: ''
    },

    location: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      showDialog: false,

      inputLocation: '',

      errorMessages: []
    }
  },

  computed: {
    hint () {
      let hint = this.dialogHint;

      let replaceStr = '[RELATIVE_LOCATION]';

      if (!this.checkLocation(this.inputLocation)) {
        this.errorMessages.push('Invalid input, example: "pixiv_downloads/"');
      } else {
        this.errorMessages = [];

        if (!!this.location) {
          replaceStr = this.location;
        }
      }

      hint = hint.replace('{{location}}', '[RELATIVE_LOCATION]');

      return hint;
    }
  },

  watch: {
    inputLocation(val) {
      if (this.checkLocation(val)) {
        this.$emit('update:location', val);
      }
    },

    showDialog(val) {
      if (val === true) {
        this.inputLocation = this.location;
      }
    }
  },

  mounted() {
    this.inputLocation = this.location;
  },

  methods: {
    checkLocation(location) {
      return /^([^:?<>|"'*@#$&./]+\/)*$/i.test(location);
    }
  }
}
</script>
