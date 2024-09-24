/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-21 13:26:02
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-22 11:24:09
 * @FilePath: \webextension-pixiv-toolkit\src\background\updates\update6_0_0.js
 */
import { app } from "../Application";
import pathjoin from "@/modules/Util/pathjoin";
import defaultSettings from "@/config/default";

/**
 * Update to 6.0.0
 */
export default async () => {
  let settings = await app().getService('setting').getSettings();
  let updateSettings = Object.assign({}, defaultSettings, settings, {
    version: '6.4.2',
  });

  /**
   * Update `ugoiraRenameRule`
   */
  updateSettings.ugoiraRenameRule = !settings.ugoiraRenameFormat ?
                                    defaultSettings.ugoiraRenameRule :
                                    settings.ugoiraRenameFormat;

  /**
   * Update `mangaRenameRule`
   */
  updateSettings.mangaRenameRule = pathjoin(
    settings.mangaRelativeLocation,
    settings.mangaRenameFormat,
    settings.mangaImageRenameFormat
  );

  if (!updateSettings.mangaRenameRule) {
    updateSettings.mangaRenameRule = defaultSettings.mangaRenameRule;
  }

  /**
   * Update `illustRenameRule`
   */
  updateSettings.illustRenameRule = pathjoin(
    settings.illustrationRelativeLocation,
    settings.illustrationRenameFormat,
    settings.illustrationImageRenameFormat
  );

  if (!updateSettings.illustRenameRule) {
    updateSettings.illustRenameRule = defaultSettings.illustRenameRule;
  }

  /**
  * Update `novelRenameRule`
  */
  updateSettings.novelRenameRule = pathjoin(
    settings.novelRelativeLocation,
    settings.novelRenameFormat
  );

  if (!updateSettings.novelRenameRule) {
    updateSettings.novelRenameRule = defaultSettings.novelRenameRule;
  }

  /**
   * Update `pixivComicEpisodeRenameRule`
   */
  updateSettings.pixivComicEpisodeRenameRule = pathjoin(
    settings.pixivComicRelativeLocation,
    settings.pixivComicImageRenameFormat
  );

  if (!updateSettings.pixivComicEpisodeRenameRule) {
    updateSettings.pixivComicEpisodeRenameRule = defaultSettings.pixivComicEpisodeRenameRule;
  }

  updateSettings.illustrationPageNumberStartWithOne = settings.illustrationPageNumberStartWithOne ? 1 : 0;
  updateSettings.mangaPageNumberStartWithOne = settings.MangaPageNumberStartWithOne ? 1 : 0;
  updateSettings.pixivComicPageNumberStartWithOne = settings.pixivComicPageNumberStartWithOne ? 1 : 0;

  if (updateSettings.globalZipMultipleImages === 0) {
    updateSettings.globalZipMultipleImages = 1;
    updateSettings.downloadSaveMode = 1;
  }

  app().getService('setting').updateSettings(updateSettings);

  console.log(updateSettings);
  console.log(`update patched, target: 6.0.0`);
}
