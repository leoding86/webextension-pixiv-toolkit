import DownloadRelativeLocationDialog from '@@/components/options/DownloadRelativeLocationDialog';
import History from '@@/components/History';
import Options from '@@/components/Options'
import RenameIllustrationDialog from '@@/components/options/RenameIllustrationDialog';
import RenameIllustrationImageDialog from '@@/components/options/RenameIllustrationImageDialog';
import RenameMangaDialog from '@@/components/options/RenameMangaDialog';
import RenameMangaImageDialog from '@@/components/options/RenameMangaImageDialog';
import RenameNovelDialog from '@@/components/options/RenameNovelDialog';
import RenameUgoiraDialog from '@@/components/options/RenameUgoiraDialog';
import Router from 'vue-router'
import Sponsors from '@@/components/Sponsors';
import ThirdParty from '@@/components/ThirdParty';
import UgoriaExtendDialog from '@@/components/options/UgoiraExtendDialog'
import Vue from 'vue'

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
      path: '/visit-history',
      name: 'VisitHistory',
      component: () => import('@@/components/VisitHistory')
    }, {
      path: '/downloads',
      name: 'Downloads',
      component: () => import('@@/components/Downloads')
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
    }, {
      path: '/diagnosis-messages',
      name: 'DiagnosisMessages',
      component: () => import('@@/components/DiagnosisMessages')
    }
  ]
})
