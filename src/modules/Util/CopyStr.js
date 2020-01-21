class CopyStr {
  static copy(str) {
    window.getSelection().removeAllRanges();

    let rangeNode = document.createElement('div');
    rangeNode.style.width = 0;
    rangeNode.style.height = 0;
    rangeNode.innerText = str;
    document.body.appendChild(rangeNode);

    let range = document.createRange();
    range.selectNode(rangeNode);
    window.getSelection().addRange(range);

    document.execCommand('copy');

    rangeNode.remove();
  }
}

export default CopyStr;
