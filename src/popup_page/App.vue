<template>
  <div id="popup">
    <div class="top-header">
      <h1><span>Pixiv</span>Toolkit</h1>
      <a href="#" @click="openGithub" class="starit"><img src="../options_page/assets/github.svg">{{ tl('_star_it') }} !</a>
    </div>
    <div class="entries">
      <div class="entry">
        <a href="#" @click="openHistory" class="button">{{ tl('_history') }}</a>
      </div>
      <div class="entry">
        <a href="#" @click="openDownloadManager" class="button">{{ tl('_download_manager') }}</a>
      </div>
      <div class="entry">
        <a href="#" @click="openReportIssue" class="button">{{ tl('_report_issue') }}</a>
      </div>
      <div class="entry">
        <a href="#" @click="openOptionsPage" class="button">{{ tl('_settings') }}</a>
      </div>
      <div class="entry" v-if="browserItems.showReloadInPopup">
        <a href="#" @click="reloadExtension" class="button">{{ tl('Reload') }}</a>
      </div>
    </div>
    <div class="header">
      <h2>{{ tl('_number_of_works_downloaded') }}</h2>
    </div>
    <div class="body">
      <div class="card"
        v-html="totalDownloaded">
      </div>
      <div class="work-info" v-if="properties">
        <div class="header">
          <h2>{{ tl('_infomation_of_current_work') }}</h2>
        </div>
        <div class="card">
          <ul>
            <li class="work-info__entity" v-for="property in displayProperties"
              :key="property">
              <span v-if="properties[property] !== undefined">
                <span class="work-info__property">{{ tl(property) }}</span>
                <strong class="work-info__proerty-value">{{ stripTags(properties[property]) }}</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";
import browser from "@/modules/Extension/browser";

export default {
  mixins: [
    SuperMixin
  ],

  data() {
    return {
      displayProperties: [
        'id', 'title', 'comment', 'description', 'createDate', 'uploadDate', 'type',
        'bookmarkCount', 'likeCount', 'responseCount', 'viewCount'
      ],

      properties: null,

      downloadManagerOpenning: false,
    }
  },

  computed: {
    totalDownloaded() {
      let count = parseInt(this.browserItems.statIllustDownloaded) +
        parseInt(this.browserItems.statUgoiraDownloaded) +
        parseInt(this.browserItems.statMangaDownloaded) +
        parseInt(this.browserItems.statNovelDownloaded) +
        parseInt(this.browserItems.statComicEpisodeDownloaded || 0) +
        parseInt(this.browserItems.statUnkownDownloaded || 0);

      return `<strong>${count}</strong> ` + this.tl('work' + (count > 1 ? 's' : ''));
    }
  },

  mounted() {
    let self = this;

    /**
     * Fetch the current active tab
     */
    browser.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      if (!tabs[0].url || !/^https?:\/{2}www\.pixiv\.net/.test(tabs[0].url)) {
        return;
      }

      let port = browser.tabs.connect(tabs[0].id, {
        name: 'popup'
      });

      port.onMessage.addListener(message => {
        self.properties = message.info;
      });

      port.postMessage({
        type: 'fetch-info'
      });
    });
  },

  methods: {
    openOptionsPage() {
      browser.tabs.create({
        url: browser.runtime.getURL('options_page/index.html#/')
      });
    },

    openReportIssue() {
      browser.tabs.create({
        url: 'https://github.com/leoding86/webextension-pixiv-toolkit/issues'
      });
    },

    openGithub() {
      browser.tabs.create({
        url: 'https://github.com/leoding86/webextension-pixiv-toolkit'
      });
    },

    openHistory() {
      browser.tabs.create({
        url: browser.runtime.getURL('options_page/index.html#/history')
      });
    },

    async openDownloadManager() {
      if (this.downloadManagerOpenning) {
        return;
      }

      this.downloadManagerOpenning = true;

      let response;

      let timeout = setTimeout(() => {
        window.open(browser.runtime.getURL('options_page/downloads.html'), '_blank');
        this.downloadManagerOpenning = false;
      }, 600);

      response = await browser.runtime.sendMessage({
        action: 'download:checkIfDownloadManagerOpened'
      });

      clearTimeout(timeout);

      if (response.result) {
        await browser.windows.update(response.data.windowId, { focused: true });
        browser.tabs.update(response.data.tabId, { active: true });
      } else {
        window.open(browser.runtime.getURL('options_page/downloads.html'), '_blank');
      }

      this.downloadManagerOpenning = false;
    },

    reloadExtension() {
      browser.runtime.reload();
    }
  }
}
</script>

<style lang="scss">
html, body, div, h1, h2, ul, li {
  margin: 0;
  padding: 0;
}

body {
  background: #f7f7f7;
}

#popup {
  width: 290px;
  margin: auto 20px;

  .top-header {
    position: relative;
    margin: auto -20px;
    padding: 20px;
    background: #0097FA;

    h1 {
      font-weight: 500;
      color: #fff;

      span {
        font-weight: 300;
      }
    }

    .starit {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 12px;
      text-decoration: none;
      background: #fff;
      border-radius: 3px;
      padding: 8px 10px;
      color: #000;
      box-shadow: 0;
      transition: all 1s;

      &:hover {
        box-shadow: 0 0 3px #ccc;
      }

      img {
        position: relative;
        top: -2px;
        padding-right: 5px;
        width: 15px;
        vertical-align: middle;
      }
    }
  }

  .entries {
    margin: auto -20px;
    padding: 0 10px;
    display: flex;
    background: #fff;
    flex-wrap: wrap;
    justify-content: space-between;

    .entry {
      width: 155px;
      position: relative;
    }

    a {
      margin: 8px;
      display: block;
      padding: 8px 0;
      text-align: center;
      border-radius: 3px;
      background: #fff;
      text-decoration: none;
      color: #000;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);

      &:hover {
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .header {
    margin-top: 10px;

    h2 {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .body {
    margin: 20px 0;
  }

  .footer {
    position: relative;
    margin: 20px auto;
    text-align: center;

    .button {
      display: inline-block;
      height: 20px;
      line-height: 20px;
      padding: 5px 10px;
      text-decoration: none;
      border-right: #ccc 1px solid;
      color: #666;

      &:last-child {
        border-right: none;
      }

      &:hover {
        color: #0062d1;
      }

      img {
        width: 15px;
        vertical-align: middle;
        padding-right: 3px;
        position: relative;
        top: -2px;
      }
    }
  }
}

.card {
  font-size: 12px;
  margin: 15px 0;
  padding: 15px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  color: #666;
  background: #fff;
  border-radius: 5px;

  strong {
    color: #000;
    padding-right: 5px;
  }
}

.work-info {
  ul, li {
    list-style: none;
  }

  .card {
    max-height: 225px;
    overflow-y: auto;
  }

  .work-info__entity {
    margin: 5px 0;

    &:first-child {
      margin: 0;
    }
  }

  .work-info__property {
    display: block;
  }
}
</style>
