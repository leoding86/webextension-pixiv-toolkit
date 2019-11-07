<template>
  <div id="popup">
    <div class="top-header">
      <h1><span>Pixiv</span>Toolkit</h1>
      <a href="#" @click="openGithub" class="starit"><img src="../options_page/assets/github.svg">{{ tl('Star_it') }} !</a>
    </div>
    <div class="header">
      <h2>{{ tl('Number_of_works_downloaded') }}</h2>
    </div>
    <div class="body">
      <div class="card"
        v-html="totalDownloaded">
      </div>
      <div class="work-info" v-if="properties">
        <div class="header">
          <h2>{{ tl('Infomation_of_current_work') }}</h2>
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
    <div class="footer">
      <a href="#" @click="openReportIssue" class="button">{{ tl('Report_issue') }}</a>
      <a href="#" @click="openOptionsPage" class="button">{{ tl('Settings') }}</a>
    </div>
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";

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

      properties: null
    }
  },

  computed: {
    totalDownloaded() {
      let count = parseInt(this.browserItems.statIllustDownloaded) +
        parseInt(this.browserItems.statUgoiraDownloaded) +
        parseInt(this.browserItems.statMangaDownloaded) +
        parseInt(this.browserItems.statNovelDownloaded);

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
      browser.runtime.openOptionsPage();
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
    background: #fff;
    border-bottom: 1px solid #ddd;

    h1 {
      font-weight: 500;

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
      background: #eee;
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
    max-height: 255px;
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