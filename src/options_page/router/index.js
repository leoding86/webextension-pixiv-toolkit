import Vue from 'vue'
import Router from 'vue-router'
import Options from '@@/components/Options'
import UgoriaExtendDialog from '@@/components/options/UgoiraExtendDialog'
import RenameUgoiraDialog from '@@/components/options/RenameUgoiraDialog';
import RenameMangaDialog from '@@/components/options/RenameMangaDialog';
import RenameMangaImageDialog from '@@/components/options/RenameMangaImageDialog';
import RenameNovelDialog from '@@/components/options/RenameNovelDialog';
import RenameIllustrationDialog from '@@/components/options/RenameIllustrationDialog';
import RenameIllustrationImageDialog from '@@/components/options/RenameIllustrationImageDialog';
import ThirdParty from '@@/components/ThirdParty';
import Sponsors from '@@/components/Sponsors';
import History from '@@/components/History';
import DownloadRelativeLocationDialog from '@@/components/options/DownloadRelativeLocationDialog';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Options',
      component: Options,
      children: [
          {
              path: 'ugoira-extend',
              name: 'UgoiraExtend',
              component: UgoriaExtendDialog,
          }, {
              path: 'rename-ugoira',
              name: 'RenameUgoira',
              component: RenameUgoiraDialog
          }, {
              path: 'rename-manga',
              name: 'RenameManga',
              component: RenameMangaDialog
          }, {
              path: 'rename-manga-image',
              name: 'RenameMangaImage',
              component: RenameMangaImageDialog
          }, {
              path: 'rename-illustration',
              name: 'RenameIllustration',
              component: RenameIllustrationDialog
          }, {
              path: 'rename-illustration-image',
              name: 'RenameIllustrationImage',
              component: RenameIllustrationImageDialog
          }, {
            path: 'download-relative-dialog',
            name: 'DownloadRelativeLocationDialog',
            component: DownloadRelativeLocationDialog
          }, {
            path: 'rename-novel',
            name: "RenameNovel",
            component: RenameNovelDialog
          }
      ]
    }, {
      path: '/illust-history',
      name: 'IllustHistory',
      component: () => import('@@/components/IllustHistory')
    }, {
      path: '/visit-history',
      name: 'VisitHistory',
      component: () => import('@@/components/VisitHistory')
    }, {
      path: '/third-party',
      name: 'ThirdParty',
      component: ThirdParty
    }, {
      path: '/sponsors',
      name: 'Sponsors',
      component: Sponsors
    }, {
      path: '/history',
      name: 'History',
      component: History
    }, {
      path: '/test',
      name: 'Test',
      component: () => import('@@/components/Test')
    }
  ]
})
