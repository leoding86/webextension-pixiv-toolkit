import Vue from 'vue'
import Router from 'vue-router'
import Options from '@/components/Options'
import UgoriaExtendDialog from '@/components/UgoiraExtendDialog'
import RenameUgoiraDialog from '@/components/RenameUgoiraDialog';
import RenameMangaDialog from '@/components/RenameMangaDialog';
import RenameMangaImageDialog from '@/components/RenameMangaImageDialog';

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
          }
      ]
    }
  ]
})
