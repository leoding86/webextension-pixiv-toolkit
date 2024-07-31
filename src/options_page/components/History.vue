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
        :item-size="coverSize.height + 10"
        v-slot="{ item }"
      >
        <v-card class="history-item">
          <div class="history-item__thumb"
            @click="openInNew(item)"
            :style="{ width: coverSize.width + 'px', height: coverSize.height + 'px' }"
          >
            <cacheable-image class="history-item__thumb-body"
              :class="{'history-item__thumb-body--blur': item.r && !disableBlurOnR}"
              :src="item.cover"
              mode="background"
            ></cacheable-image>
          </div>
          <div class="history-item__info">
            <div class="history-item__info-entity history-item__info-entity--blod">
              <span v-if="displayWorkTypeLabel"
                class="history-item__info-tag"
                :class="`history-item__info-tag--type${item.type}`"
              >{{ castWorkType(item) }}</span>
              <span v-if="item.downloaded_at"
                class="history-item__info-tag history-item__info-tag--success"
              >{{ tl('_downloaded') }}</span>
              {{ item.title }}
            </div>
            <div class="history-item__info-entity history-item__info-entity--sub"><a :href="item.url" target="_blank">{{ item.url }}</a> <v-icon small>open_in_new</v-icon></div>
            <div class="history-item__info-entity history-item__info-entity--sub">{{ castDate(item.visited_at) }}</div>
          </div>
          <div class="history-item__actions">
            <v-btn class="history-item__actions-btn"
              flat icon small
              @click="deleteOne(item)"
            >
              <svg class="c01204" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="16" height="16">
                <path d="M1115 1024l690 691-90 90-691-690-691 690-90-90 690-691-690-691 90-90 691 690 691-690 90 90-690 691z"></path>
              </svg>
            </v-btn>
          </div>
        </v-card>
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
import { RecycleScroller } from 'vue-virtual-scroller';
import CacheableImage from '@@/components/CacheableImage';
import Db from '@/modules/Db/Db';
import itemTypeMaps from '@/config/itemTypeMaps';
import moment from 'moment';
import browser from '@/modules/Extension/browser';

export default {
  components: {
    'cacheable-image': CacheableImage,
    'recycle-scroller': RecycleScroller
  },

  data() {
    return {
      total: 0,
      historyItems: [],
      totalLoaded: 0,
      page: 1,
      disableBlurOnR: false,
      loading: false,
      allLoaded: false,
      confirmDialog: false,
      itemDeleteReady: null,
      searchQuery: '',
      searchTimeout: null,
      enableSaveVisitHistory: true,
      itemTypeMaps,
    };
  },

  created() {
    /**
     * Init some data
     */
    this.enableSaveVisitHistory = this.browserItems.enableSaveVisitHistory;
    this.latestListDate = null;

    if (this.$i18n.locale === 'zh_CN') {
      this.dateFormat = 'YYYY[年]MMMMDD[日] dddd';
      this.timeFormat = 'A h:mm';
    } else {
      this.dateFormat = 'dddd, MMMM DD, YYYY';
      this.timeFormat = 'h:mmA';
    }

    this.historyRepo = Db.getDb().historyRepo();

    this.loadHistoryItems();

    window.addEventListener('scroll', this.handleScroll);
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
        default:
          height = 150;
      }

      size = {
        width: Math.floor(height * 1.25),
        height: height
      };

      this.historyItems.forEach(item => {
        if (undefined === item.time) {
          item.size = size.height;
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
        this.historyItems = [];
        this.page = 1;
        this.totalLoaded = 0;
        this.allLoaded = false;

        if (val.trim().length > 0) {
          this.searchHistoryItems();
        } else {
          this.loadHistoryItems();
        }
      }, 600);
    }
  },

  methods: {
    castDate(time) {
      return moment.unix(time).format(this.timeFormat);
    },

    castWorkType(item) {
      let type = itemTypeMaps[item.type];

      if (type) {
        return itemTypeMaps[item.type];
      } else {
        return 'uncatelogued';
      }
    },

    handleScroll() {
      if (document.documentElement.scrollHeight - window.innerHeight - window.scrollY < (window.innerHeight / 2)
        && !this.loading
        && !this.allLoaded
      ) {
        if (this.searchQuery.trim().length > 0) {
          this.searchHistoryItems();
        } else {
          this.loadHistoryItems();
        }
      }
    },

    openInNew(item) {
      window.open(item.url, '_blank');
    },

    deleteOne(illust) {
      this.confirmDialog = true;

      /**
       * Cache item ready to delete
       */
      this.itemDeleteReady = illust;
    },

    deleteIllust() {
      this.confirmDialog = false

      this.historyItems.splice(this.historyItems.indexOf(this.itemDeleteReady), 1);
      this.total--;

      browser.runtime.sendMessage({
        to: 'ws',
        action: 'history:deleteItem',
        args: {
          uid: this.itemDeleteReady.uid
        }
      });
    },

    /**
     * Get history items
     */
    async loadHistoryItems() {
      if (this.loading) {
        return;
      }

      this.loading = true;

      let items = await this.historyRepo.getItems({ page: this.page });

      if (items.length > 0) {
        this.historyItems = this.historyItems.concat(items);
        this.page++;
      } else {
        this.allLoaded = true;
      }

      this.loading = false;
    },

    /**
     * Search histories
     */
    async searchHistoryItems() {
      if (this.loading) {
        return;
      }

      this.loading = true;

      let items = await this.historyRepo.searchItems({ page: this.page, query: this.searchQuery });

      if (items.length > 0) {
        this.historyItems = this.historyItems.concat(items);
        this.page++;
      } else {
        this.allLoaded = true;
      }

      this.loading = false;
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
    :first-child {
      margin-left: 0;
    }

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
      padding-left: 8px;
    }

    .history-item__info-entity {
      font-size: 12px;
      width: 380px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-top: 6px;

      a {
        text-decoration: none;
        color:#555;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .history-item__info-entity--blod {
      font-weight: 700;
    }

    .history-item__info-entity--sub {
      color: #999;
    }

    .history-item__info-tag {
      position: relative;
      display: inline-block;
      margin-right: 5px;
      padding: 1px 8px;
      background: #3367d6;
      color: #fff;
      font-weight: 300;
      border-radius: 20px;

      &--success {
        color: #fff;
        background: green;
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
  box-shadow: none;

  .v-input__slot {
    box-shadow: none !important;
    border: 1px solid #dedede;
    border-radius: 100px !important;
  }
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
