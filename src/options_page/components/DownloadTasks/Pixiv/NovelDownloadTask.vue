<template>
  <v-card class="download-task">
    <v-card-title style="display:block;">
      <div class="download-task__title">{{ data.title }}</div>
      <div class="download-task__url">
        <a :href="data.url" target="_blank">{{ data.url }}</a> <v-icon small>open_in_new</v-icon>
      </div>
      <div class="download-task__progress" :title="downloadProgress + '%'">
        <v-progress-linear v-model="downloadProgress" height="5"></v-progress-linear>
      </div>
      <div class="download-task__section">
        <div class="download-task__state">{{ readableState(data.state) }}</div>
        <div class="download-task__actions">
          <span v-if="data.downloadId" class="download-task__action" @click="$emit('show_in_folder', data)">{{ tl('_show_in_folder') }}</span>
          <span class="download-task__action download-task__action--delete" @click="$emit('delete', data)">{{ tl('_delete') }}</span>
        </div>
      </div>
    </v-card-title>
    <div class="download-task__type-tag">Pixiv Novel</div>
  </v-card>
</template>

<script>
export default {
  name: 'pixiv-novel-download-task',

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

        if (data.state instanceof Number) {
          return false;
        }

        return true;
      }
    }
  },

  data() {
    return {
      downloadProgress: 0,
    }
  },

  watch: {
    data: {
      deep: true,
      handler(val) {
        this.downloadProgress = val.progress * 100;
      }
    }
  },

  created() {
    this.downloadProgress = this.data.progress * 100;
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
