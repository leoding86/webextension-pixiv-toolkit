/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-08-08 08:43:42
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-09-08 11:40:47
 */
//@ts-check
export default Object.assign({}, {
    version: '6.0.0',
    enableExtend: false,
    enableWhenUnderSeconds: 1,
    extendDuration: 3,

    ugoiraQuanlity: 10,

    /**
     * @dprecated
     */
    enableExtension: true,

    /**
     * @version 1.8.5
     * @deprecated
     * @since 4.1.3
     * Pack ugoira frames info to zip file
     */
    enablePackUgoiraFramesInfo: true,

    /**
     * @version 1.8.8
     * Set manga page chunk
     */
    mangaPagesInChunk: 99,

    /**
     * @version 2.0.3
     */

    /**
     * @deprecated
     * @since 3.3.4
     */
    // showHistoryWhenUpdateCompleted: true,

    /**
     * @version 2.0.5
     */
    downloadSaveAs: false,

    /**
     * @version 2.1
     */
    featureKnown: false,

    /**
     * @version 2.2
     * @deprecated since 4.4.1
     */
    // subscribedUsers: {},

    /**
     * @version 2.3
     */
    autoActivateDownloadPanel: false,

    /**
     * @version 2.7
     */
    enablePtkSearch: true,
    enableSaveVisitHistory: true,

    /**
     * @version 2.8
     */
    notSaveNSFWWorkInHistory: false,

    /**
     * @version 3.1
     */
    novelIncludeDescription: false,

    /**
     * @since 3.2.2
     */
    statUgoiraDownloaded: 0,
    statMangaDownloaded: 0,
    statNovelDownloaded: 0,
    statIllustDownloaded: 0,

    /**
     * @since 3.4.3
     */
    visitHistoryType: 'list', // list || grid

    /**
     * @since 3.6
     */
    guideShowed: false,

    /**
     * @since 3.7.3
     * @deprecated since 4.2.2
     */
    illustrationKeepPageNumber: false,

    /**
     * @since 3.8.2
     */
    illustrationPageNumberStartWithOne: -2, // -2: fellow PageNumberStartWithOne setting, 0: disable, 1: enable

    mangaPageNumberStartWithOne: -2, // -2: fellow PageNumberStartWithOne setting, 0: disable, 1: enable

    /**
     * @since 3.9.0
     */
    askDownloadSavedWork: true,

    /**
     * @since 3.9.1
     */
    importantNoticeDisplayed: false,

    /**
     * @since 4.0.0
     */
    downloadTasksWhenDownloadingImages: 3,

    /**
     * @since 4.1
     */
    historyBackup: [],

    /**
     * @since 4.2
     */
    animationJsonFormat: 1,
    language: 'default',

    /**
     * @since 4.4.0
     */
    maxHistoryItems: 10000,

    /**
     * @deprecated since version 6.0.0
     */
    maxDownloadRecords: 10000,

    /**
     * @since 4.5.0
     */
    enableSaveDownloadHistory: 1,

    displayWorkTypeLabel: true,

    workCoverSize: 1,

    /**
     * @since 4.8.0
     */
    mangaPageNumberLength: -2, // -2: fellow pageNumberLength setting, others as same as pageNumberLength setting

    illustrationPageNumberLength: -2, // -2: fellow pageNumberLength setting, others as same as pageNumberLength setting

    /**
     * @since 4.10.0
     */
    showUpdateChangeLog: false,

    /**
     * @since 5.0.0
     */
    ugoiraConvertTool: 'default',
    ugoiraCustomFFmpegCommand: '',

    /**
     * @since 5.1.0
     * @deprecated 6.0.0
     * @var {number} 0: disable, 1: enable, 2: only for multiple files
     */
    illustrationCreateSubdirectory: 1,

    /**
     * @since 5.2.0
     */
    disableDownloadsShelf: false,

    /**
     * @since 5.3.0
     */
    multipleDownloadsGapTime: 150,

    /**
     * @since 5.5.0
     */
    downloadPanelPosition: 'center',
    downloadPanelStyle: 1,

    /**
     * @since 5.5.1
     */
    showReloadInPopup: false,
    showPixivOmina: true,

    /**
     * @since 5.5.3
     * @deprecated 6.0.0
     */
    pixivComicRenameFormat: '{id}_{title}',
    pixivComicPageNumberStartWithOne: -2, // -2: fellow PageNumberStartWithOne setting, 0: disable, 1: enable
    pixivComicPageNumberLength: -2, // -2: fellow pageNumberLength setting, others as same as pageNumberLength setting

    /**
     * @since 5.5.4
     */
    enableDownloadMetadata: false,

    /**
     * @since 6.0.0
     */
    illustRenameRule: '{id}_{title}',
    mangaRenameRule: '{id}_{title}}',
    ugoiraRenameRule: '{id}_{title}',
    novelRenameRule: '{id}_{title}',
    pixivComicEpisodeRenameRule: '{id}_{title}/{numberingTitle}_{workTitle}',
    pixivComicEpisodePageNumberStartWithOne: -2,
    pixivComicEpisodePageNumberLength: -2,
    fanboxPostRenameRule: '{id}_{title}/{pageNum}',
    fanboxPostPageNumberStartWithOne: -2,
    fanboxPostPageNumberLength: -2,
    globalTaskPageNumberStartWithOne: 0, // 0: disable, 1: enable
    globalTaskPageNumberLength: -1, // -1: dynamic, 0: disable, 2-4,
    maxProcessDownloadTasks: 3,

    /**
     * @since 6.1.0
     */
    globalZipMultipleImages: 1,
    illustRenameImageRule: 'p{pageNum}',
    mangaRenameImageRule: 'p{pageNum}',
    pixivComicEpisodeRenameImageRule: 'p{pageNum}',
    fanboxPostRenameImageRule: 'p{pageNum}',

    /**
     * internal
     * @since 6.2.0
     */
    ugoiraFFmpegGIFCliArgs: '-f concat -i input.txt -plays 0 out.gif',
    ugoiraFFmpegAPNGCliArgs: '-f concat -i input.txt -plays 0 output.apng',
    ugoiraFFmpegWEBMCliArgs: '-f concat -i input.txt -safe 0 output.webm',
    ugoiraFFmpegMP4CliArgs: '-f concat -i input.txt -safe 0 -c copy output.mp4',

    /**
     * @since 6.3.0
     */
    downloadMode: 1, // 1: legacy; 2: download manager
    dontCreateWorkFolder: 0,
    combinWRRuleAndIRRuleWhenDontCreateWorkFolder: 0,

    /**
     * @since 6.4.0
     */
    downloadSaveMode: 0, // 0: pack in zip; 1: save in folder

    /**
     * @since 1.0.0
     * @deprecated since version 6.0.0
     */
    ugoiraRenameFormat: '',
    mangaRenameFormat: '',
    mangaImageRenameFormat: '',

    /**
     * @since 2.0.3
     */
    enableExtTakeOverDownloads: false,
    downloadRelativeLocation: '',

    /**
     * @since 3.1.0
     * @deprecated since version 6.0.0
     */
    novelRenameFormat: '',

    /**
     * @since 3.3.2
     * @deprecated since version 6.0.0
     */
    illustrationRenameFormat: '',
    illustrationImageRenameFormat: '',

    /**
     * @since 3.9.2
     * @deprecated since version 6.0.0
     */
    ugoiraRelativeLocation: '',
    illustrationRelativeLocation: '',
    mangaRelativeLocation: '',
    novelRelativeLocation: '',

    /**
     * @since 4.2.2
     * @deprecated since version 6.0.0
     */
    alwaysPack: false,

    /**
     * @since 5.0.0
     * @deprecated since version 6.0.0
     */
    downloadPackFiles: true,

    /**
     * @since 5.3.0
     * @deprecated since version 6.0.0
     */
    pixivComicRelativeLocation: '',

    /**
     * @since 5.5.3
     * @deprecated since version 6.0.0
     */
    pixivComicImageRenameFormat: '{id}_{title}_p{pageNum}',
  });
