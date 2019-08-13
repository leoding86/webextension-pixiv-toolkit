import IllustHistory from '@/repositories/IllustHistory'

let illustHistory = new IllustHistory(),
    importedCount = 0

let importIllustItemsChunk = (chunks, index = 0) => {
  return new Promise(resolve => {
    let items = chunks[index]

    if (!items) {
      resolve()
    }

    let total = items.length,
        completed = 0

    items.forEach(item => {
      illustHistory.putIllust(item).then(() => {
        importedCount++

        completed++

        if (completed >= total) {
          console.log(importedCount)

          postMessage({
            importedCount: importedCount
          })

          resolve(importIllustItemsChunk(chunks, index + 1))
        }
      })
    })
  })
}

onmessage = e => {
  let chunks = [],
      num = 100

  while (e.data.items.length > 0) {
    chunks.push(e.data.items.splice(0, num))
  }

  illustHistory.init().then(() => {
    importIllustItemsChunk(chunks).then(() => {
      postMessage({
        imported: true
      })
    })
  })
}
