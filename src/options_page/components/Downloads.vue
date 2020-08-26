<template>
  <div class="container container--small page-history">
    <div class="history__header">
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

    <div class="history__header-action">
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
      class="history-items"
      v-if="datasets.length > 0"
    >
      <recycle-scroller
        class="scroller"
        :items="datasets"
        :item-size="90"
        page-mode
        key-field="_id"
        v-slot="{ item }"
      >
        <div class="history-item">
          <div class="history-item__thumb"
            v-if="!1"
            @click="openInNew(item)"
          >
            <cacheable-image class="history-item__thumb-body"
              :src="item.thumb"
              mode="background"
            ></cacheable-image>
          </div>
          <div class="history-item__info">
            <div class="history-item__info-entity history-item__info-entity--blod">
              <a class="maintitle" :href="caseWorkUrl(item)" target="_blank">{{ item.title || item._id }}</a>
            </div>
            <div class="history-item__info-entity history-item__info-entity--blod">
              <a class="subtitle" :href="caseUserUrl(item.userId)"
                target="_blank"
                v-if="item.userId"
              >{{ item.userName}}</a>
              <span v-else>-</span>
            </div>
            <div class="history-item__info-entity history-item__info-entity--sub">{{ caseDate(item.downloaded_at) }}<span style="margin-left:15px;">{{ caseWorkUrl(item) }}</span></div>
          </div>
          <div class="history-item__actions">
            <v-btn
              class="history-item__actions-btn"
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
      class="history__status-notice"
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
      if (!time) {
        return '-';
      }

      let date = new Date(time * 1000);

      if (browser.i18n.getUILanguage().toLowerCase().indexOf('zh') === 0) {
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/');
      } else {
        return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
      }
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
      if (item.isNovel) {
        return "Novel";
      }

      let type = item.type;

      if (type == 1) {
        return "Manga";
      } else if (type == 2) {
        return "Ugoira";
      } else if (type == 0) {
        return "Illustration";
      } else {
        return "Unkown";
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
          this.datasets = message.data.datasets;

          if (message.data.datasets.length < this.step) {
            this.allLoaded = true;
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
  .history__header-action {
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

  .history__header {
    position: -webkit-sticky;
    position: sticky;
    top: 80px;
    z-index: 5;

    .v-input__slot {
      box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    .v-text-field__details {
      display: none;
    }
  }

  .history-items {
    position: relative;
    margin-top: 8px;
    box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    background: #fff;

    .scroller {
      width: 100%;
      height: 100%;
    }

    .history-item {
      position: relative;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      height: 90px;
      border-bottom: 1px solid #ccc;
      background: #fff;

      &:hover {
        background: #f6f6f6;

        .history-item__actions {
          width: 120px;
        }
      }
    }

    .history-item__thumb{
      position: relative;
      width: 120px;
      height: 89px;
      cursor: pointer;
      overflow: hidden;
      background: url(../../statics/img/rthumb.png) center center no-repeat;
    }

    .history-item__thumb-body {
      position: absolute;
      width: 100%;
      height: 100%;
      transition: opacity 0.5s;
    }

    .history-item__thumb-body--blur {
      opacity: 0;

      &:hover {
        opacity: 1;
      }
    }

    .history-item__info {
      flex: auto;
    }

    .history-item__info-entity {
      font-size: 12px;
      padding: 6px 0 0 8px;
      width: 380px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .history-item__info-entity--blod {
      font-weight: 700;
    }

    .history-item__info-entity--sub {
      color: #999;
    }

    .history-item__info-badge {
      position: relative;
      margin-right: 5px;
      padding: 3px;
      background: #ccc;
      font-weight: 300;

      &--type0 {
        color: #fff;
        background:brown;
      }

      &--type1 {
        color: #fff;
        background:cadetblue;
      }

      &--type2 {
        color: #fff;
        background:coral;
      }

      &--type-novel {
        color: #fff;
        background: gray;
      }
    }

    .history-item__actions {
      width: 0;
      text-align: right;
      overflow: hidden;
    }

    .history-item__actions-btn {
      color: rgb(88, 88, 88);
    }
  }

  .history__status-notice {
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
</style>
