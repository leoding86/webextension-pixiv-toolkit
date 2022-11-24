<template>
  <v-card class="download-task">
    <v-card-title style="display:block;">
      <div class="download-task__title">{{ data.title }}</div>
      <div class="download-task__url">
        <a :href="data.url" target="_blank">{{ data.url }}</a> <v-icon small>open_in_new</v-icon>
      </div>
      <div class="download-task__progress" :title="(processProgress > 0 ? processProgress : downloadProgress) + '%'">
        <v-progress-linear v-if="processProgress == 0" v-model="downloadProgress" height="5"></v-progress-linear>
        <v-progress-linear v-else v-model="processProgress" height="5"></v-progress-linear>
      </div>
      <div class="download-task__section">
        <div class="download-task__state">{{ readableState(data.state) }}</div>
        <div class="download-task__actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </v-card-title>
    <div class="download-task__type-tag">{{ tag }}</div>
  </v-card>
</template>

<script>
export default {
  name: 'download-task',

  props: {
    data: {
      validator(data) {
        if (!data instanceof Object) {
          return false;
        }

        if (!data.id instanceof String) {
          return false;
        }

        if (!data.title instanceof String) {
          return false;
        }

        if (!data.url instanceof String) {
          return false;
        }

        if (!(data.progress instanceof String || data.progress instanceof Number)) {
          return false;
        }

        if (data.processProgress && !data.processProgress instanceof Number) {
          return false;
        }

        if (data.state instanceof Number) {
          return false;
        }

        return true;
      }
    },

    tag: {
      type: String,
      default: 'Untagged',
    },
  },

  data() {
    return {
      //
    }
  },

  computed: {
    downloadProgress() {
      return this.data.progress * 100;
    },

    processProgress() {
      if (!this.data.processProgress) {
        return 0;
      } else {
        return this.data.processProgress * 100;
      }
    }
  },

  created() {
    //
  },

  methods: {
    readableState(state) {
      switch (state) {
        case 1:
          return 'Pending';
        case 2:
          return 'Downloading';
        case 3:
          return 'Paused';
        case 4:
          return 'Complete';
        case -1:
          return 'Failure';
        case 99:
          return 'Processing';
        default:
          return 'Unkown'
      }
    }
  }
}
</script>
