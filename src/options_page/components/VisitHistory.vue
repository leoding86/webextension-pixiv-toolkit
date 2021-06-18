<template>
  <div class="container container--small page-history">
    <v-alert
      :value="true"
      type="warning"
      v-if="!enableSaveVisitHistory">{{ tl('_save_visit_history_has_been_disabled') }}</v-alert>

    <div class="history__header">
      <!-- Searchbar -->
      <v-text-field class="search-panel"
        label="Solo"
        single-line
        solo
        flat
        :placeholder="tl('_search_history')"
        v-model="searchQuery"
      ></v-text-field>
      <!-- /Searchbar -->
    </div>

    <div class="history__header-action">
      <v-btn
        flat
        icon
        @click="disableBlurOnRClicked"
      >
        <v-icon>{{ disableBlurOnR ? 'visibility' : 'visibility_off' }}</v-icon>
      </v-btn>
    </div>

    <v-layout row wrap
      class="history-items"
      v-if="historyItems.length > 0"
    >
      <recycle-scroller
        class="scroller"
        :items="historyItems"
        page-mode
        key-field="id"
        v-slot="{ item }"
      >
        <div v-if="!!item.time" class="history-date">
          {{ formatDate(item.time) }}
        </div>
        <div v-else class="history-item"
          :style="{ height: coverSize.height + 'px' }"
        >
          <div class="history-item__thumb"
            @click="openInNew(item)"
            :style="{ width: coverSize.width + 'px', height: coverSize.height + 'px' }"
          >
            <cacheable-image class="history-item__thumb-body"
              :class="{'history-item__thumb-body--blur': item.r && !disableBlurOnR}"
              :src="item.isNovel ? item.image : item.images.thumb"
              mode="background"
            ></cacheable-image>
          </div>
          <div class="history-item__info">
            <div class="history-item__info-entity history-item__info-entity--blod">
              <span
                v-if="displayWorkTypeLabel"
                class="history-item__info-badge"
                :class="`history-item__info-badge--type${item.isNovel ? '-novel' : item.type}`"
              >{{ caseWorkType(item) }}</span>
              <a class="maintitle" :href="caseWorkUrl(item)" target="_blank">{{ item.title }}</a>
            </div>
            <div class="history-item__info-entity history-item__info-entity--blod">
              <a class="subtitle" :href="caseUserUrl(item.userId)"
                target="_blank"
                v-if="item.userId"
              >{{ item.userName}}</a>
              <span v-else>-</span>
            </div>
            <div class="history-item__info-entity history-item__info-entity--sub">{{ caseDate(item.viewed_at) }}<span style="margin-left:15px;">{{ caseWorkUrl(item) }}</span></div>
          </div>
          <div class="history-item__actions">
            <v-btn
              class="history-item__actions-btn"
              flat
              icon
              small
              @click="deleteOne(item)"
            >
                <svg class="c01204" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="16" height="16">
                  <path d="M1115 1024l690 691-90 90-691-690-691 690-90-90 690-691-690-691 90-90 691 690 691-690 90 90-690 691z"></path>
                </svg>
            </v-btn>
          </div>
        </div>
      </recycle-scroller>
    </v-layout>

    <p v-if="!loading && statusNotice"
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

    <v-dialog v-model="confirmDialog"
      width="500">
      <v-card>
        <v-card-title>{{ tl('_notice') }}</v-card-title>
        <v-card-text>
          <p style="font-size:14px;">{{ tl('_this_operation_cannot_be_reversed_are_you_sure') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteIllust"
            color="error">{{ tl('_delete') }}</v-btn>
          <v-btn @click="confirmDialog = false">{{ tl('_keep') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller, DynamicScroller } from 'vue-virtual-scroller';
import PageTitle from '@@/components/PageTitle';
import CacheableImage from '@@/components/CacheableImage';
import Supports from '@@/components/Supports';
import IllustHistoryPort from '@/modules/Ports/IllustHistoryPort/RendererPort';
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
      historyItems: [],
      totalLoaded: 0,
      offset: 0,
      step: 50,
      disableBlurOnR: false,
      loading: false,
      allLoaded: false,
      confirmDialog: false,
      illustDeleteReady: null,
      searchQuery: '',
      searchTimeout: null,
      enableSaveVisitHistory: true,
      unlimitedStoragePermission: null,
    };
  },

  created() {
    this.windowScrollEventBinded = false;

    this.illustHistoryPort = IllustHistoryPort.getInstance();
    this.illustHistoryPort.port.onMessage.addListener(this.handleIllustHistoryPortResponse);

    /**
     * Init some data
     */
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;
    this.unlimitedStoragePermission = this.browserItems.unlimitedStoragePermission;
    this.latestListDate = null;

    if (this.$i18n.locale === 'zh_CN') {
      this.dateFormat = 'YYYY[年]MMMMDD[日] dddd';
      this.timeFormat = 'A h:mm';
    } else {
      this.dateFormat = 'dddd, MMMM DD, YYYY';
      this.timeFormat = 'h:mmA';
    }
  },

  beforeMount() {
    /**
     * Store visit history type
     */
    browser.storage.local.set({
      visitHistoryType: 'list'
    });

    /**
     * Get general information
     */
    this.illustHistoryPort.countItems({
      endkey: '_'
    });
  },

  mounted() {
    let vm = this;

    this.getHistoryItems();
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  computed: {
    statusNotice() {
      if (this.historyItems.length <= 0) {
        return 'There is no any history';
      } else {
        return '';
      }
    },

    importProgress() {
      if (this.importTotal === 0) {
        return ''
      }

      return ' (' + this.importedCount + '/' + this.importTotal + ')'
    },

    disableBlurOnRText() {
      return this.tl(this.disableBlurOnR ? '_enable_mask' : '_disable_mask')
    },

    displayWorkTypeLabel() {
      return this.browserItems.displayWorkTypeLabel;
    },

    coverSize() {
      let height, size;

      switch (this.browserItems.workCoverSize) {
        case 1:
          height = 80;
          break;
        case 2:
          height = 110;
          break;
        case 3:
          height = 150;
      }

      size = {
        width: Math.floor(height * 1.25),
        height: height
      };

      this.historyItems.forEach(item => {
        if (undefined === item.time) {
          item.size = size.height + 10;
        }
      });

      return size;
    }
  },

  watch: {
    searchQuery(val) {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      this.searchTimeout = setTimeout(() => {
        let promise;

        this.historyItems = [];
        this.totalLoaded = 0;
        this.offset = 0;

        if (val.trim().length > 0) {
          this.searchHistoryItems();
        } else {
          this.getHistoryItems();
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

      if (item.isNovel) {
        url = 'https://www.pixiv.net/novel/show.php?id=' + item.id.substr(1);
      } else {
        url = 'https://www.pixiv.net/en/artworks/' + item.id;
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
        let promise;

        if (this.searchQuery.trim().length > 0) {
          this.searchHistoryItems();
        } else {
          this.getHistoryItems();
        }
      }
    },

    openInNew(illust) {
      window.open(this.caseWorkUrl(illust));
    },

    /**
     * Handle response from the port of IllustHistory
     */
    handleIllustHistoryPortResponse(message, port) {
      if (this.illustHistoryPort.isChannel(message.channel, 'items-count')) {
        this.total = message.data.count;
      } else if (this.illustHistoryPort.isChannel(message.channel, 'items-list')) {
        if (!this.windowScrollEventBinded) {
          window.addEventListener('scroll', this.handleScroll);
          this.windowScrollEventBinded = false;
        }

        if (undefined === message.error && message.data.dataset && message.data.dataset.length > 0) {
          this.totalLoaded += message.data.dataset.length;

          for (let i = 0; i < message.data.dataset.length; i++) {
            let item = message.data.dataset[i];
            item.size = this.coverSize.height + 10;

            if (this.latestListDate === null) {
              this.latestListDate = new Date(item.viewed_at * 1000);
              this.latestListDate.setHours(0);
              this.latestListDate.setMinutes(0);
              this.latestListDate.setSeconds(0);
              this.latestListDate.setMilliseconds(0);
              let time = this.latestListDate.getTime();
              message.data.dataset.splice(i, 0, { id: time, time: time, size: 50});
              i++;
            } else {
              let itemDate = new Date(item.viewed_at * 1000);

              if (this.latestListDate.getTime() > itemDate.getTime()) {
                itemDate.setHours(0);
                itemDate.setMinutes(0);
                itemDate.setSeconds(0);
                itemDate.setMilliseconds(0);
                let time = itemDate.getTime();
                message.data.dataset.splice(i, 0, { id: time, time: time, size: 50 });
                this.latestListDate = itemDate;
                i++;
              }
            }
          }

          this.historyItems = this.historyItems.concat(message.data.dataset);

          if (message.data.dataset.length < this.step) {
            this.allLoaded = true;
          } else {
            this.offset += this.step;
          }
        }

        this.loading = false;
      }

      if (undefined !== message.data.error) {
        throw message.data.error;
      }
    },

    deleteOne(illust) {
      this.confirmDialog = true;

      /**
       * Cache item ready to delete
       */
      this.illustDeleteReady = illust;
    },

    deleteIllust() {
      this.confirmDialog = false

      this.illustHistoryPort.deleteIllustHistory(this.illustDeleteReady);
      this.historyItems.splice(this.historyItems.indexOf(this.illustDeleteReady), 1);
      this.total--;
    },

    /**
     * Get history items
     */
    getHistoryItems() {
      this.loading = true;

      this.illustHistoryPort.listItems({
        limit: this.step,
        skip: this.offset
      });
    },

    /**
     * Search histories
     */
    searchHistoryItems() {
      let vm = this;

      this.loading = true;

      this.illustHistoryPort.searchItems({
        limit: this.step,
        skip: this.offset,
        extra: {
          query: this.searchQuery.toLowerCase()
        }
      });
    },

    disableBlurOnRClicked() {
      this.disableBlurOnR = !this.disableBlurOnR;
    },

    formatDate(time) {
      return moment(time).format(this.dateFormat);
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
      box-shadow: 0 0 3px 0 rgba(0,0,0,.3);
    }

    .v-text-field__details {
      display: none;
    }
  }

  .history-date {
    padding-top: 15px;
    font-size: 18px;
  }

  .history-items {
    position: relative;
    margin-top: 8px;

    .scroller {
      width: 100%;
      height: 100%;
    }

    .history-item {
      position: relative;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 0 3px 0 rgba(0,0,0,.3);

      &:hover {
        background: #f6f6f6;

        .history-item__actions {
          width: 120px;
        }
      }
    }

    .history-item__thumb{
      position: relative;
      cursor: pointer;
      overflow: hidden;
      background: url(../../statics/img/rthumb.png) center center no-repeat;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
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
    transform: scale(1.1);
  }
}

.vue-recycle-scroller__item-wrapper {
  overflow:visible;
}
</style>
