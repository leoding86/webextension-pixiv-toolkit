<template>
  <div class="container container--big">
    <h1>!!! TEST AREA !!!</h1>
    <h1>Components</h1>
    <h2>cacheable-image component</h2>
    <cacheable-image style="width:100px;height:100px;border:1px solid #000"
      mode="background"
      :src="image"></cacheable-image>
    <h2>app-suggest component</h2>
    <div>
      <app-suggest
        style="width:200px;border:1px solid #000"
        :icon="pixivOminaIcon"
        title="Pixiv Omina"
        subTitle="Sub title"
        link="https://www.github.com">
      </app-suggest>
    </div>
    <h1>Debug actions</h1>
    <div>
      <v-btn @click="resetVersionNumber">Reset version number</v-btn>
      <v-btn @click="resetVersionNumber({ resetSettings: false })">Reset version number without reset settings</v-btn>
      <v-btn @click="insertData">Insert histories</v-btn>
    </div>
    <h1>Debug Request module</h1>
    <div>
      <v-text-field v-model="requestUrl" label="Request URL"></v-text-field>
      <v-text-field v-model="requestOptions" label="Request Options"></v-text-field>
      <v-text-field v-model="requestResponseType" label="Response Type"></v-text-field>
      <v-btn @click="fireRequest">Fire</v-btn>
    </div>
  </div>
</template>

<script>
import Request from '@/modules/Net/Request';
import CacheableImage from './CacheableImage';
import AppSuggest from './AppSuggest';
import browser from '@/modules/Extension/browser';

export default {
  components: {
    'cacheable-image': CacheableImage,
    'app-suggest': AppSuggest
  },

  data() {
    return {
      image: 'https://s.pximg.net/www/images/logo/pixiv-logo.svg',
      pixivOminaIcon: 'https://raw.githubusercontent.com/leoding86/webextension-pixiv-toolkit/master/src/statics/remote/img/pixiv-omina.png',
      requestUrl: '',
      requestOptions: '',
      requestResponseType: ''
    }
  },

  created() {
    //
  },

  methods: {
    resetVersionNumber(options) {
      browser.storage.local.get(null, items => {
        console.log(items);
        const keys = options.resetSettings === true ? Object.keys(items) : [];

        browser.storage.local.remove(keys, () => {
          browser.storage.local.set({
            version: '0.0.1',
            guideShowed: false,
            showUpdateChangeLog: false
          }, () => {
            alert('reset done');
          });
        });
      });
    },

    insertData() {
      let startId = 70114228
      let endId = startId + 10000

      this.putExampleData(startId, endId).then(() => {
        console.log('complete')
      }).catch(() => {
        console.log('error')
      })
    },

    putExampleData(startId, endId) {
      let vm = this

      let root = 'https://www.pixiv.net/ajax/illust/'

      let url = root + startId

      console.log('request ' + url)

      return new Promise(resolve => {
        let xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.addEventListener('loadend', () => {
          let data

          try {
            data = JSON.parse(xhr.responseText)

            if (data.error === false && data.body) {
              // vm.illustHistory.putIllust({
              //   id: data.body.illustId,
              //   title: data.body.illustTitle,
              //   images: data.body.urls,
              //   type: data.body.illustType,
              //   viewed_at: Math.floor(Date.now()),
              //   r: data.body.xRestrict === 0 ? false : true
              // })
            }
          } catch (e) {
            //do nothing
          }

          startId++

          if (startId > endId) {
            resolve()
          } else {
            resolve(vm.putExampleData(startId, endId))
          }
        })
        xhr.send()
      })
    },

    fireRequest() {
      let request = new Request(this.requestUrl, JSON.parse(this.requestOptions));
      request.responseType = this.requestResponseType;
      request.addListener('onload', responseData => {
        console.log(responseData);
      });
      request.addListener('onerror', error => {
        console.log(error);
      });
      request.send();
    }
  }
}
</script>
