import {
  permissions as browserPermissions,
  downloads as browserDownloads
} from '@/content_scripts/Browser'

export default {
  methods: {
    downloadFile(url, filename) {
      if (thisApp.browserItems.enableExtTakeOverDownloads) {
        browserPermissions.contains({
          permissions: ['downloads']
        }).then(result => {
          if (result) {
            browserDownloads.download({
              url: url,
              filename: thisApp.browserItems.downloadRelativeLocation + filename
            })
          } else {
            alert('You need grant download permission for downloading using downlads setting in extension')
          }
        })
      } else {
        let a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', filename)
        a.click()
        a.remove()
      }
    }
  }
}
