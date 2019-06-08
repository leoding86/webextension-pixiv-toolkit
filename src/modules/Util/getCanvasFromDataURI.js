export default (dataURI, size) => {
  return new Promise(resolve => {
    let image = new Image(size.width, size.height)

    image.src = dataURI

    image.addEventListener('load', () => {
      let canvasDOM = document.createElement('canvas')

      canvasDOM.setAttribute('width', size.width)
      canvasDOM.setAttribute('height', size.height)

      let context = canvasDOM.getContext('2d')
      context.drawImage(image, 0, 0, size.width, size.height)

      resolve(canvasDOM)
    });
  });
}
