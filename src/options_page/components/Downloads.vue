<template>
  <div class="container container--small page-history">
    <div class="download__header">
      <!-- Searchbar -->
      <v-text-field class="search-panel"
        label="Solo"
        single-line
        solo
        flat
        :placeholder="tl('_search')"
        v-model="searchQuery"
      ></v-text-field>
      <!-- /Searchbar -->
    </div>

    <div class="download__header-action">
      <v-btn
        depressed
        style="margin-left:0;"
        :disabled="datasets.length === 0"
        @click="clearAll"
      >
        Clear all
      </v-btn>
    </div>

    <v-layout row wrap
      class="download-items"
      v-if="datasets.length > 0"
    >
      <recycle-scroller
        class="scroller"
        :items="datasets"
        :item-size="50"
        page-mode
        key-field="_id"
        v-slot="{ item }"
      >
        <div
          v-if="item.time"
          class="download-date"
        >{{ formatDate(item.time) }}</div>
        <div
          v-else
          class="download-item">
          <div class="download-item__thumb"
            v-if="!1"
            @click="openInNew(item)"
          >
            <cacheable-image class="download-item__thumb-body"
              :src="item.thumb"
              mode="background"
            ></cacheable-image>
          </div>
          <div class="download-item__info">
            <div class="download-item__info-time">{{ caseDate(item.downloaded_at) }}</div>
            <div class="download-item__info-title"><a :href="caseWorkUrl(item)">{{ item.title || item._id }}</a></div>
            <div class="download-item__info-user"><a :href="caseUserUrl(item.userId)">{{ item.userName}}</a></div>
            <div class="download-item__info-id">{{ caseWorkType(item) + ' ' + item._id.substr(1) }}</div>
          </div>
          <div class="download-item__actions">
            <v-btn
              class="download-item__actions-btn"
              flat
              icon
              small
              @click="deleteItem(item)"
            >
                <svg class="c01204" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="16" height="16">
                  <path d="M1115 1024l690 691-90 90-691-690-691 690-90-90 690-691-690-691 90-90 691 690 691-690 90 90-690 691z"></path>
                </svg>
            </v-btn>
          </div>
        </div>
      </recycle-scroller>
    </v-layout>

    <p v-if="statusNotice"
      class="download__status-notice"
    >
      {{ statusNotice }}
    </p>

    <div style="text-align:center;clear:both;margin-top:20px;" v-if="loading">
      <v-progress-circular
        indeterminate
        color="primary"
      ></v-progress-circular>
    </div>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller } from 'vue-virtual-scroller';
import PageTitle from '@@/components/PageTitle';
import CacheableImage from '@@/components/CacheableImage';
import DownloadRecordPort from '@/modules/Ports/DownloadRecordPort/RendererPort';
import moment from 'moment';

export default {
  components: {
    'page-title': PageTitle,
    'cacheable-image': CacheableImage,
    'recycle-scroller': RecycleScroller
  },

  data() {
    return {
      total: 0,
      datasets: [],
      offset: 0,
      step: 50,
      loading: false,
      allLoaded: false,
      confirmDialog: false,
      searchQuery: '',
      searchTimeout: null
    };
  },

  created() {
    this.windowScrollEventBinded = false;
    this.downloadsPort = DownloadRecordPort.getInstance();
    this.downloadsPort.port.onMessage.addListener(this.handleDownloadsPortResponse);
    this.latestListDate = null;

    if (this.$i18n.locale === 'zh_CN') {
      this.dateFormat = 'YYYY[年]MMMMDD[日] dddd';
      this.timeFormat = 'A h:mm';
    } else {
      this.dateFormat = 'dddd, MMMM DD, YYYY';
      this.timeFormat = 'h:mmA';
    }
  },

  mounted() {
    let vm = this;
    this.getDatasets();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  computed: {
    statusNotice() {
      if (this.datasets.length <= 0) {
        return 'There is no any downloads';
      } else if (this.allLoaded) {
        return 'There is no more downloads';
      }

      return '';
    }
  },

  watch: {
    searchQuery(val) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        this.datasets = [];
        this.offset = 0;

        if (val.trim().length > 0) {
          this.searchDatasets();
        } else {
          this.getDatasets();
        }
      }, 800);
    }
  },

  methods: {
    caseDate(time) {
      return moment.unix(time).format(this.timeFormat);
    },

    caseWorkUrl(item) {
      let url = '';

      if (item._id[0] === 'N') {
        url = 'https://www.pixiv.net/novel/show.php?id=' + item._id.substr(1);
      } else {
        url = 'https://www.pixiv.net/en/artworks/' + item._id.substr(1);
      }

      return url;
    },

    caseWorkType(item) {
      if (item._id.indexOf('I') === 0) {
        return 'Artwork';
      } else if (item._id.indexOf('N') === 0) {
        return 'Novel';
      } else {
        return 'Unkown';
      }
    },

    caseUserUrl(userId) {
      return `https://www.pixiv.net/member.php?id=${userId}`;
    },

    handleScroll() {
      if (document.documentElement.scrollHeight - window.innerHeight - window.scrollY < (window.innerHeight / 2)
        && !this.loading
        && !this.allLoaded
      ) {
        if (this.searchQuery.trim().length > 0) {
          this.searchDatasets();
        } else {
          this.getDatasets();
        }
      }
    },

    openInNew(illust) {
      window.open(this.caseWorkUrl(illust));
    },

    handleDownloadsPortResponse(message, port) {
      if (undefined !== message.error) {
        throw message.error;
      }

      if (this.downloadsPort.isChannel(message.channel, 'list-downloads')) {
        if (!this.windowScrollEventBinded) {
          window.addEventListener('scroll', this.handleScroll);
          this.windowScrollEventBinded = false;
        }

        if (message.data.datasets.length > 0) {
          for (let i = 0; i < message.data.datasets.length; i++) {
            let item = message.data.datasets[i];

            if (this.latestListDate === null) {
              this.latestListDate = new Date(item.downloaded_at * 1000);
              this.latestListDate.setHours(0);
              this.latestListDate.setMinutes(0);
              this.latestListDate.setSeconds(0);
              this.latestListDate.setMilliseconds(0);
              let time = this.latestListDate.getTime();
              message.data.datasets.splice(i, 0, { _id: time, time: time });
              i++;
            } else {
              let itemDate = new Date(item.downloaded_at * 1000);

              if (this.latestListDate.getTime() > itemDate.getTime()) {
                itemDate.setHours(0);
                itemDate.setMinutes(0);
                itemDate.setSeconds(0);
                itemDate.setMilliseconds(0);
                let time = itemDate.getTime();
                message.data.datasets.splice(i, 0, { _id: time, time: time });
                this.latestListDate = itemDate;
                i++;
              }
            }
          }

          this.datasets = this.datasets.concat(message.data.datasets);

          if (message.data.datasets.length < this.step) {
            this.allLoaded = true;
          } else {
            this.offset += this.skip;
          }
        }

        this.loading = false;
      }
    },

    deleteItem(item) {
      this.confirmDialog = true;
      this.downloadsPort.deleteDownload({ id: item._id });
      this.datasets.splice(this.datasets.indexOf(item), 1);
    },

    /**
     * Get history items
     */
    getDatasets() {
      this.loading = true;

      this.downloadsPort.listDownloads({
        limit: this.step,
        skip: this.offset
      });
    },

    /**
     * Search in datasets
     */
    searchDatasets() {
      let vm = this;

      this.loading = true;

      this.downloadsPort.listDownloads({
        limit: this.step,
        skip: this.offset,
        query: this.searchQuery.toLowerCase()
      });
    },

    formatDate(time) {
      return moment(time).format(this.dateFormat);
    },

    clearAll() {
      if (window.confirm('Remove all downloads history? This operate cannot be reversed.')) {
        this.downloadsPort.clearDownloads();
        this.datasets = [];
      }
    }
  }
};
</script>

<style lang="scss">
.page-history {
  .download__header-action {
    .v-input--selection-controls {
      display: inline-block;
      box-sizing: border-box;
      margin-top: 5px;
      padding-top: 0px;
      height: 36px;
      position: relative;
      top: 4px;
      left: 10px;
    }
  }

  .download__header {
    position: -webkit-sticky;
    position: sticky;
    top: 80px;
    z-index: 5;

    .v-input__slot {
      box-shadow: 0 0 3px 0 rgba(0,0,0,.3);
    }

    .v-text-field__details {
      display: none;
    }
  }

  .download-items {
    position: relative;
    margin-top: 8px;

    .scroller {
      width: 100%;
      height: 100%;
    }

    .download-date {
      font-size: 16px;
      line-height: 50px;
    }

    .download-item {
      position: relative;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      height: 40px;
      border-radius: 5px;
      box-shadow: 0 0 3px 0 rgba(0,0,0,.3);
      background: #fff;

      &:hover {
        background: #f6f6f6;

        .download-item__actions {
          width: 50px;
        }
      }
    }

    .download-item__info {
      flex: auto;
      display: flex;
      font-size: 12px;
      line-height: 40px;

      a {
        color: #333;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      &-time {
        width: 80px;
        padding-left: 1em;
        color: #555;
      }

      &-title {
        width: 300px;
        font-weight: 700;
      }

      &-user {
        width: 150px;
        font-weight: 700;
      }

      &-id {
        color: #555;
      }
    }

    .download-item__actions {
      width: 0;
      text-align: right;
      overflow: hidden;
    }

    .download-item__actions-btn {
      color: rgb(88, 88, 88);
    }
  }

  .download__status-notice {
    font-size: 14px;
    text-align: center;
    line-height: 4;
    color: #dedede;
    text-shadow: 0 -1px 0 #555;
  }
}

.search-panel {
  margin: 10px 0;
}

// override
.cacheable-image-bg {
  transition: transform 300ms;

  &:hover {
    transform: scale(1.2);
  }
}

.vue-recycle-scroller__item-wrapper {
  overflow:visible;
}
</style>
