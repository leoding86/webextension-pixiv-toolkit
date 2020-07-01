<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ settingTitle }}
        <v-tooltip
          v-if="settingTip !== ''"
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
          <span>{{ settingTip }}</span>
        </v-tooltip>
      </v-list-tile-title>
      <v-list-tile-sub-title>{{ settingHint }}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <change-location-btn
        :dialog-title="dialogTitle"
        :dialog-hint="dialogHint"
        :location.sync="location"
        :disabled="!browserItems.enableExtTakeOverDownloads"
      ></change-location-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import ChangeLocationBtn from "@@/components/options/ChangeLocationBtn";

export default {
  components: {
    'change-location-btn': ChangeLocationBtn
  },

  props: {
    value: {
      required: true,
      type: String
    },

    settingTitle: {
      required: true,
      type: String
    },

    settingTip: {
      required: false,
      type: String,
      default: ''
    },

    dialogTitle: {
      required: true,
      type: String
    },

    dialogHint: {
      required: true,
      type: String
    },
  },

  computed: {
    settingHint() {
      if (this.location) {
        return this.location;
      } else {
        return 'Not set';
      }
    },

    location: {
      get() {
        return this.value;
      },

      set(val) {
        this.$emit('input', val);
      }
    }
  }
}
</script>
