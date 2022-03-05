//@ts-check
export default Object.assign({}, {
    version: '1.0.0',
    enableExtend: false,
    enableWhenUnderSeconds: 1,
    extendDuration: 3,

    ugoiraRenameFormat: '',
    ugoiraQuanlity: 10,
    mangaRenameFormat: '',
    mangaImageRenameFormat: '',

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
    enableExtTakeOverDownloads: false,
    downloadRelativeLocation: null,

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
    novelRenameFormat: '',

    /**
     * @since 3.2.2
     */
    statUgoiraDownloaded: 0,
    statMangaDownloaded: 0,
    statNovelDownloaded: 0,
    statIllustDownloaded: 0,

    /**
     * @since 3.3.2
     */
    illustrationRenameFormat: '',
    illustrationImageRenameFormat: '',

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
    illustrationPageNumberStartWithOne: false,

    MangaPageNumberStartWithOne: false,

    /**
     * @since 3.9.0
     */
    askDownloadSavedWork: true,

    /**
     * @since 3.9.1
     */
    importantNoticeDisplayed: false,

    /**
     * @since 3.9.2
     */
    ugoiraRelativeLocation: '',

    illustrationRelativeLocation: '',

    mangaRelativeLocation: '',

    novelRelativeLocation: '',

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
     * @since 4.2.2
     */
    alwaysPack: false,

    /**
     * @since 4.4.0
     */
    maxHistoryItems: 10000,
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
    mangaPageNumberLength: 0,

    illustrationPageNumberLength: 0,

    /**
     * @since 4.10.0
     */
    showUpdateChangeLog: false,

    /**
     * @since 5.0.0
     */
    downloadPackFiles: true,
    ugoiraConvertTool: 'default',
    ugoiraCustomFFmpegCommand: '',

    /**
     * @since 5.1.0
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
     * @sinace 5.5.3
     */
    pixivComicRenameFormat: '{id}_{title}',
    pixivComicImageRenameFormat: '{id}_{title}_p{pageNum}',
    pixivComicRelativeLocation: '',
    pixivComicPageNumberStartWithOne: false,
    pixivComicPageNumberLength: 0,
  });
