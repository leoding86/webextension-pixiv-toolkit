/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-11 11:09:14
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-22 13:13:08
 * @FilePath: \webextension-pixiv-toolkit\src\background\services\DownloadService.js
 */
import browser from "@/modules/Extension/browser";
import AbstractService from "./AbstractService";
import SettingService from "./SettingService";
import Db from "@/modules/Db/Db";
import moment from "moment";
import FileSystem from "@/options_page/modules/FileSystem";

class DownloadService extends AbstractService {
  static instance;

  openingDownloadManager = false;

  /**
   * @type {Map<string, string>}
   */
  cachedDownloadIdFilenameMap = new Map();

  constructor() {
    super();
    this.listenOnDeterminingFilename();
  }

  listenOnDeterminingFilename() {
    if (DownloadService.onDeterminingFilenameListenered === true) return;
    DownloadService.onDeterminingFilenameListenered = true;

    browser.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
      const filenameSuggestion = {
        conflictAction: "uniquify",
      };

      if (this.cachedDownloadIdFilenameMap.has(downloadItem.url)) {
        filenameSuggestion.filename = this.cachedDownloadIdFilenameMap.get(downloadItem.url);
        delete this.cachedDownloadIdFilenameMap.delete(downloadItem.url);
      } else {
        filenameSuggestion.filename = downloadItem.filename;
      }

      suggest(filenameSuggestion);
    });
  }

  static getService() {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }

    return DownloadService.instance;
  }

  async getDownloadManagerTab() {
    const setting = await SettingService.getService().getSetting('_download_manager_tab');

    if (setting._download_manager_tab &&
      setting._download_manager_tab.tabId &&
      setting._download_manager_tab.windowId
    ) {
      try {
        const tab = await browser.tabs.get(setting._download_manager_tab.tabId);
        return tab;
      } catch (error) {
        Db.getDb().trackedErrorRepo().addItem({ error, created_at: moment.now() });
      }
    }
  }

  /**
   * @returns {Promise<boolean>}
   */
  async checkDownloadManagerReady() {
    const response = await browser.runtime.sendMessage({
      to: 'op',
      action: 'download:checkReady'
    });

    return response;
  }

  checkDownloadManagerReadyInDelay(wait = 2000) {
    return new Promise(resolve => {
      setTimeout(
        async () => resolve(await this.checkDownloadManagerReady()),
        wait
      );
    });
  };

  async ensureDownloadManagerOpen() {
    const tab = await this.getDownloadManagerTab();

    if (tab) {
      return this.checkDownloadManagerReady();
    }

    if (this.openingDownloadManager) {
      return this.checkDownloadManagerReadyInDelay();
    }

    this.openingDownloadManager = true;

    const openedDownloadManagetTab = await browser.tabs.create({
      url: browser.runtime.getURL('/options_page/downloads.html#/'),
      active: false
    });

    if (openedDownloadManagetTab) {
      await SettingService.getService().updateSettings({
        _download_manager_tab: {
          tabId: openedDownloadManagetTab.id,
          windowId: openedDownloadManagetTab.windowId
        }
      });

      this.openingDownloadManager = false;

      return this.checkDownloadManagerReadyInDelay();
    } else {
      this.openingDownloadManager = false;
    }
  }

  cacheDownloadIdFilename(url, filename) {
    this.cachedDownloadIdFilenameMap.set(url, filename);
  }

  async saveFile({ url, filename }) {
    this.cacheDownloadIdFilename(url, filename);
    const downloadId = await FileSystem.getDefault().saveFile({ url, filename });
    return downloadId;
  }
}

/**
 * @type {boolean} Prevent listen the event multiple times
 */
DownloadService.onDeterminingFilenameListenered = false;

export default DownloadService;
