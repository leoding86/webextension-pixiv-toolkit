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

    enableExtension: true,

    /**
     * @version 1.8.5
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
     */
    subscribedUsers: {},

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

    accessTechorusCdn: false,

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
    downloadTasksWhenDownloadingImages: 3
  });
