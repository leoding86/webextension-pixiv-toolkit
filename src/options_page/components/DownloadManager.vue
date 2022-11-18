<template>
  <v-app>
    <template v-for="download in downloads">
      <download-task :data="download"
        :key="download.id"
        style="margin-bottom:15px;"
        :tag="getDownloadTaskTagName(download)"
        @delete="downloadTask"
        @show_in_folder="showInFolder"
      ></download-task>
    </template>
  </v-app>
</template>

<script>
import { RuntimeError } from '@/errors';
import { app } from '../DownloadsApplication';
import DownloadTask from './DownloadTask.vue';

export default {
  components: {
    DownloadTask,
},

  data() {
    return {
      downloads: [],
      mockDownloads: []
    }
  },

  created() {
    this.ready = false;
    this.app = app();
    this.downloadService = this.app.getService('download');
  },

  mounted() {
    this.mockDownloads.push({
      id: 123,
      title: 'title',
      url: 'http://www.baidu.com/',
      type: 'PIXIV_UGOIRA',
      progress: 0.1,
      generateProgress: 0.1,
      state: 1,
    }, {
      id: 132,
      title: 'title2',
      url: 'http://www.baidu.com/123',
      type: 'PIXIV_ILLUST',
      progress: 0.1,
      generateProgress: 0.1,
      state: 1,
    });

    this.loadDownloads();
  },

  methods: {
    getDownloadTaskTagName(download) {
      if (download.type === 'PIXIV_UGOIRA') {
        return 'Pixiv Ugoira';
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
        this.downloads = this.downloadService.getAvaliableDownloads();
        // console.log(this.downloads);
        this.loadDownloads();
      }, 1000);
    },

    downloadTask(download) {
      if (!download.deleted) {
        download.deleted = true;
        this.downloadService.deleteDownload(download.id);
      }
    },

    showInFolder(download) {
      this.downloadService.showInFolder(download.downloadId);
    }
  }
}
</script>

<style lang="scss">
.download-task {

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
  border-radius: 3px !important;
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
