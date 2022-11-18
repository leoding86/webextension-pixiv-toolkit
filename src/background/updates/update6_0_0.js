import { app } from "../Application";
import pathjoin from "@/modules/Util/pathjoin";
import defaultSettings from "@/config/default";

/**
 * Update to 6.0.0
 */
export default async () => {
  let settings = await app().getService('setting').getSettings();
  let updateSettings = {};

  /**
   * Update `ugoiraRenameRule`
   */
  if (settings.ugoiraRenameFormat) {
    updateSettings.ugoiraRenameRule = settings.ugoiraRenameFormat;
  }

  /**
   * Update `mangaRenameRule`
   */
  updateSettings.mangaRenameRule = pathjoin(
    settings.mangaRelativeLocation,
    settings.mangaRenameFormat,
    settings.mangaImageRenameFormat
  );

  if (updateSettings.mangaRenameRule === '') {
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

  if (updateSettings.illustRenameRule === '') {
    updateSettings.illustRenameRule = defaultSettings.illustRenameRule;
  }

  /**
  * Update `novelRenameRule`
  */
  updateSettings.novelRenameRule = pathjoin(
    settings.novelRelativeLocation,
    settings.novelRenameFormat
  );

  if (updateSettings.novelRenameRule === '') {
    updateSettings.novelRenameRule = defaultSettings.novelRenameRule;
  }

  /**
   * Update `pixivComicEpisodeRenameRule`
   */
  updateSettings.pixivComicEpisodeRenameRule = pathjoin(
    settings.pixivComicRelativeLocation,
    settings.pixivComicImageRenameFormat
  );

  if (updateSettings.pixivComicEpisodeRenameRule === '') {
    updateSettings.pixivComicEpisodeRenameRule = defaultSettings.pixivComicEpisodeRenameRule;
  }

  app().getService('setting').updateSettings(updateSettings);

  console.log(updateSettings);
  console.log(`update patched, target: 6.0.0`);
}
