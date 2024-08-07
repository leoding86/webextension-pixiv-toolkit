<template>
  <div class="download-manager">
    <div class="dataset-empty-notice" v-if="downloads.length === 0">{{ tl('_there_isnt_any_download') }}</div>
    <recycle-scroller class="scroller" :items="downloads" :item-size="132"
      page-mode key-field="id" v-slot="{ item }"
    >
      <download-task :data="item"
        :key="item.id"
        style="margin-bottom:15px;"
        :tag="getDownloadTaskTag(item)"
        @delete="deleteDownloadTask"
        @show_in_folder="showInFolder"
      >
        <template slot="actions">
          <span v-if="item.downloadId" class="download-task__action" @click="showInFolder(item)">{{ tl('_show_in_folder') }}</span>
          <span class="download-task__action download-task__action--delete" @click="prepareDeleteDownloadTask(item)">{{ tl('_delete') }}</span>
        </template>
      </download-task>
    </recycle-scroller>

    <v-dialog v-model.sync="confirmDialog"
      width="500"
    >
      <v-card>
        <v-card-title>{{ tl('_notice') }}</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">{{ tl('_this_operation_cannot_be_reversed_are_you_sure') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn depressed @click="deleteDownloadTask(preparedDeleteItem)"
            color="error">{{ tl('_delete') }}</v-btn>
          <v-btn depressed @click="confirmDialog = false">{{ tl('_cancel') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { RecycleScroller } from 'vue-virtual-scroller';
import { RuntimeError } from '@/errors';
import { app } from '../DownloadsApplication';
import DownloadTask from './DownloadTask.vue';

export default {
  components: {
    DownloadTask,
    'recycle-scroller': RecycleScroller,
},

  data() {
    return {
      downloads: [],
      mockDownloads: [],
      preparedDeleteItem: null,
      confirmDialog: false,
    }
  },

  created() {
    window.onbeforeunload = event => {
      return event.returnValue = 'Close the tab will lose all download process. Close it ?';
    };

    this.ready = false;
    this.app = app();
    this.downloadService = this.app.getService('download');
  },

  mounted() {
    // let max = 200;

    // while (max-- > 0) {
    //   this.mockDownloads.push({
    //     id: max + 1,
    //     title: 'title',
    //     url: 'http://www.baidu.com/',
    //     type: 'PIXIV_UGOIRA',
    //     progress: 0.1,
    //     generateProgress: 0.1,
    //     state: 1,
    //   });
    // }

    this.loadDownloads();
  },

  methods: {
    getDownloadTaskTag(download) {
      if (download.type === 'PIXIV_UGOIRA') {
        return 'Pixiv Ugoira ' + (download.convertType || 'Custom');
      } else if (download.type === 'PIXIV_ILLUST') {
        return 'Pixiv Illust';
      } else if (download.type === 'PIXIV_MANGA') {
        return 'Pixiv Manga';
      } else if (download.type === 'PIXIV_NOVEL') {
        return 'Pixiv Novel';
      } else if (download.type === 'PIXIV_COMIC_EPISODE') {
        return 'Pixiv Comic Episode';
      } else if (download.type === 'FANBOX_POST') {
        return 'Fanbox Post';
      }

      throw new RuntimeError('Invalid download type');
    },

    loadDownloads() {
      setTimeout(() => {
        let downloads = this.downloadService.flushChangedTasks();
        let index = 0;

        while (this.downloads[index] && downloads.length > 0) {
          for (let i = 0; i < downloads.length; i++) {
            if (this.downloads[index].id === downloads[i].id) {
              this.$set(this.downloads, index, downloads[i]);
              downloads.splice(i, 1);
              break;
            }
          }
          index++;
        }

        if (downloads.length > 0) {
          this.downloads = this.downloads.concat(downloads);
        }

        this.loadDownloads();
      }, 600);
    },

    prepareDeleteDownloadTask(download) {
      this.preparedDeleteItem = download;
      this.confirmDialog = true;
    },

    deleteDownloadTask(download) {
      this.downloadService.deleteDownload(download.id);

      for (let i = 0; i < this.downloads.length; i++) {
        if (this.downloads[i].id === download.id) {
          this.downloads.splice(i, 1);
        }
      }

      this.confirmDialog = false;
    },

    showInFolder(download) {
      this.downloadService.showInFolder(download.downloadId);
    }
  }
}
</script>

<style lang="scss">
.download-task {
  box-shadow: none;
}

.download-task__title {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.download-task__url {
  font-size: 12px;
  line-height: 26px;

  a {
    color: gray;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
}

.download-task {
  .v-progress-linear {
    margin: 8px 0;
  }
}

.download-task__type-tag {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 12px;
  line-height: 20px;
  padding: 0 10px;
  color: white;
  background: #3367d6;
  border-radius: 20px !important;
}

.download-task__section {
  display: flex;
  justify-content: space-between;
}

.download-task__action {
  margin-left: 20px;
  cursor: pointer;
}

.download-task__action--delete {
  color: #ff5252;
}

.download-task__action--delete:hover {
  color: #ff8484;
}
</style>
