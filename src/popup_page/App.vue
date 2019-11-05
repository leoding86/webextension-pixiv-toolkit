<template>
  <div id="popup">
    <div class="top-header">
      <h1><span>Pixiv</span>Toolkit</h1>
      <a href="#" @click="openGithub" class="starit"><img src="../options_page/assets/github.svg">Star It !</a>
    </div>
    <div class="header">
      <h2>Number of works downloaded</h2>
    </div>
    <div class="body">
      <div class="downloaded-stat"
        v-html="ugoiraDownloaded"></div>
      <div class="downloaded-stat"
        v-html="illustDownloaded"></div>
      <div class="downloaded-stat"
        v-html="mangaDownloaded"></div>
      <div class="downloaded-stat"
        v-html="novelDownloaded"></div>
    </div>
    <div class="footer">
      <a href="#" @click="openReportIssue" class="button">Report issue</a>
      <a href="#" @click="openOptionsPage" class="button">Settings</a>
    </div>
  </div>
</template>

<script>
import browser from '@/modules/Extension/browser';

export default {
  computed: {
    ugoiraDownloaded() {
      let count = this.$root.$data.browserItems.statUgoiraDownloaded;

      return `<strong>${count}</strong>` + ' ugoira' + (count > 1 ? 's' : '');
    },

    illustDownloaded() {
      let count = this.$root.$data.browserItems.statIllustDownloaded;
      return `<strong>${count}</strong>` + ' illust' + (count > 1 ? 's' : '');
    },

    mangaDownloaded() {
      let count = this.$root.$data.browserItems.statMangaDownloaded;
      return `<strong>${count}</strong>` + ' manga' + (count > 1 ? 's' : '');
    },

    novelDownloaded() {
      let count = this.$root.$data.browserItems.statNovelDownloaded;
      return `<strong>${count}</strong>` + ' novel' + (count > 1 ? 's' : '');
    }
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
html, body, div, h1, h2 {
  margin: 0;
  padding: 0;
}

body {
  background: #f7f7f7;
}

#popup {
  width: 255px;
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
    padding-top: 10px;

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

.downloaded-stat {
  font-size: 12px;
  padding: 15px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  color: #666;
  background: #fff;

  &:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  &:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  strong {
    color: #000;
    padding-right: 5px;
  }
}
</style>
