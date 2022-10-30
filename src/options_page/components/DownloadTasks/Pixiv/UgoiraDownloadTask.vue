<template>
  <v-card class="download-task">
    <v-card-title style="display:block;">
      <div class="download-task__title">{{ data.title }}</div>
      <div class="download-task__url">
        <a :href="data.url" target="_blank">{{ data.url }}</a> <v-icon small>open_in_new</v-icon>
      </div>
      <div class="download-task__progress" :title="(downloadGenerateProgress > 0 ? downloadGenerateProgress : downloadProgress) + '%'">
        <v-progress-linear v-if="downloadGenerateProgress == 0" v-model="downloadProgress" height="5"></v-progress-linear>
        <v-progress-linear v-else v-model="downloadGenerateProgress" height="5"></v-progress-linear>
      </div>
      <div class="download-task__section">
        <div class="download-task__state">{{ readableState(data.state) }}</div>
        <div class="download-task__actions">
          <span v-if="data.downloadId" class="download-task__action" @click="$emit('show_in_folder', data)">{{ tl('_show_in_folder') }}</span>
          <span class="download-task__action download-task__action--delete" @click="$emit('delete', data)">{{ tl('_delete') }}</span>
        </div>
      </div>
    </v-card-title>
    <div class="download-task__type-tag">Pixiv Ugoira</div>
  </v-card>
</template>

<script>
export default {
  name: 'pixiv-ugoira-download-task',

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

        if (!(data.generateProgress instanceof String || data.generateProgress instanceof Number)) {
          return false;
        }

        if (data.state instanceof Number) {
          return false;
        }

        return true;
      }
    }
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

    downloadGenerateProgress() {
      return this.data.generateProgress * 100;
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
