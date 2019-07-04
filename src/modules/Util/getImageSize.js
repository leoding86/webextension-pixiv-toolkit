export default (src) => {
  return new Promise(resolve => {
    let image = new Image();

    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height
      })
    }

    image.src = src
  })
}
