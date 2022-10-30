<template>
  <v-app>
    <template v-for="download in downloads">
      <component :is="getComponentName(download)" :data="download"
        :key="download.id"
        style="margin-bottom:15px;"
        @delete="downloadTask"
        @show_in_folder="showInFolder"
      ></component>
    </template>
  </v-app>
</template>

<script>
import { RuntimeError } from '@/errors';
import { app } from '../DownloadsApplication';
import PixivIllustDownloadTask from './DownloadTasks/Pixiv/IllustDownloadTask.vue';
import PixivMangaDownloadTask from './DownloadTasks/Pixiv/MangaDownloadTask.vue';
import PixivUgoiraDownloadTask from './DownloadTasks/Pixiv/UgoiraDownloadTask.vue';
import PixivNovelDownloadTask from './DownloadTasks/Pixiv/NovelDownloadTask.vue';

export default {
  components: {
    PixivIllustDownloadTask,
    PixivMangaDownloadTask,
    PixivUgoiraDownloadTask,
    PixivNovelDownloadTask,
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
    getComponentName(download) {
      if (download.type === 'PIXIV_UGOIRA') {
        return 'pixiv-ugoira-download-task';
      } else if (download.type === 'PIXIV_ILLUST') {
        return 'pixiv-illust-download-task';
      } else if (download.type === 'PIXIV_MANGA') {
        return 'pixiv-manga-download-task';
      } else if (download.type === 'PIXIV_NOVEL') {
        return 'pixiv-novel-download-task';
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
