import Options from '@@/components/Options'
import Router from 'vue-router'
import Sponsors from '@@/components/Sponsors';
import ThirdParty from '@@/components/ThirdParty';
import Vue from 'vue';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Options',
      component: Options,
    }, {
      path: '/history',
      name: 'History',
      component: () => import('@@/components/History')
    }, {
      path: '/third_party',
      name: 'ThirdParty',
      component: ThirdParty
    }, {
      path: '/sponsors',
      name: 'Sponsors',
      component: Sponsors
    }, {
      path: '/change_logs',
      name: 'ChangeLogs',
      component: () => import('@@/components/ChangeLogs')
    }, {
      path: '/test',
      name: 'Test',
      component: () => import('@@/components/Test')
    }, {
      path: '/diagnosis_messages',
      name: 'DiagnosisMessages',
      component: () => import('@@/components/DiagnosisMessages')
    }
  ]
})
